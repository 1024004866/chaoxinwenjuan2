import { getFCP, getFID, getLCP, getTTFB } from 'web-vitals'

const APP_ID = 'xiaomu-survey'
const API = process.env.REACT_APP_MONITOR_API_URL
  || (process.env.NODE_ENV === 'development' ? 'http://localhost:7001/report' : '')
const VISITOR_KEY = `monitor-visitor-${APP_ID}`
const STARTED_KEY = '__xiaomu_monitor_started__'

type Report = Record<string, unknown>

const redactSensitive = (input: unknown): unknown => {
  if (Array.isArray(input)) return input.map(redactSensitive)
  if (input && typeof input === 'object') {
    return Object.fromEntries(Object.entries(input as Record<string, unknown>).map(([key, value]) => [
      key,
      /password|token|authorization|secret/i.test(key) ? '[REDACTED]' : redactSensitive(value),
    ]))
  }
  return input
}

const sanitizeBody = (body: unknown) => {
  if (typeof body !== 'string' || !body) return ''
  try {
    return JSON.stringify(redactSensitive(JSON.parse(body))).slice(0, 1000)
  } catch {
    return body
      .replace(/((?:password|token|authorization|secret)=)[^&]*/gi, '$1[REDACTED]')
      .slice(0, 1000)
  }
}

const visitorId = (() => {
  const saved = localStorage.getItem(VISITOR_KEY)
  if (saved) return saved
  const value = crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`
  localStorage.setItem(VISITOR_KEY, value)
  return value
})()

const page = () => ({
  pageUrl: window.location.pathname,
  link: `${window.location.pathname}${window.location.search}`,
  domain: window.location.host,
})

const report = (event: Report) => {
  if (!API) return
  const data = {
    ...event,
    ...page(),
    appId: APP_ID,
    markUserId: visitorId,
    userTimeStamp: Date.now(),
  }
  const image = new Image()
  image.src = `${API}?appId=${APP_ID}&data=${encodeURIComponent(JSON.stringify([data]))}`
}

const monitorRoutes = () => {
  let lastLocation = `${window.location.pathname}${window.location.search}`
  const emit = () => {
    const current = `${window.location.pathname}${window.location.search}`
    if (current === lastLocation) return
    lastLocation = current
    report({ type: 'pageView' })
  }
  const wrap = (name: 'pushState' | 'replaceState') => {
    const original = window.history[name]
    window.history[name] = function (...args) {
      const result = original.apply(this, args)
      queueMicrotask(emit)
      return result
    }
  }
  wrap('pushState')
  wrap('replaceState')
  window.addEventListener('popstate', emit)
  report({ type: 'pageView' })
}

const monitorPerformance = () => {
  const metrics = { fcp: 0, fid: 0, lcp: 0, ttfb: 0 }
  getFCP(metric => { metrics.fcp = metric.value })
  getFID(metric => { metrics.fid = metric.value })
  getLCP(metric => { metrics.lcp = metric.value })
  getTTFB(metric => { metrics.ttfb = metric.value })

  window.addEventListener('load', () => {
    window.setTimeout(() => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined
      report({
        type: 'performance',
        ...metrics,
        whiteTime: navigation?.domContentLoadedEventEnd || 0,
        dnsTime: navigation ? navigation.domainLookupEnd - navigation.domainLookupStart : 0,
        tcpTime: navigation ? navigation.connectEnd - navigation.connectStart : 0,
        rescources: performance.getEntriesByType('resource')
          .filter(item => !API || !item.name.startsWith(API))
          .slice(0, 20)
          .map(item => ({
          resource: item.name.slice(0, 500),
          duration: item.duration,
          type: (item as PerformanceResourceTiming).initiatorType,
          size: (item as PerformanceResourceTiming).decodedBodySize || 0,
        })),
      })
    }, 2500)
  })
}

const monitorXhr = () => {
  const originalOpen = XMLHttpRequest.prototype.open
  const originalSend = XMLHttpRequest.prototype.send
  XMLHttpRequest.prototype.open = function (method: string, url: string | URL, ...args: any[]) {
    ;(this as any).__monitor = { method: method.toUpperCase(), url: String(url), start: 0 }
    return originalOpen.call(this, method, url, ...args as [boolean, string?, string?])
  }
  XMLHttpRequest.prototype.send = function (body?: Document | XMLHttpRequestBodyInit | null) {
    const info = (this as any).__monitor
    if (info) {
      info.start = performance.now()
      info.body = sanitizeBody(body)
      this.addEventListener('loadend', () => {
        if (info.url.includes('.hot-update.')) return
        report({
        type: 'request',
        transport: 'xhr',
        url: info.url.split('?')[0],
        method: info.method,
        reqBody: info.body,
        reqHeaders: '',
        status: this.status,
        requestType: this.status >= 200 && this.status < 400 ? 'done' : 'error',
        cost: performance.now() - info.start,
        })
      })
    }
    return originalSend.call(this, body)
  }
}

const monitorFetch = () => {
  const original = window.fetch
  window.fetch = async (input, init = {}) => {
    const started = performance.now()
    const url = input instanceof Request ? input.url : String(input)
    const method = (init.method || (input instanceof Request ? input.method : 'GET') || 'GET').toUpperCase()
    try {
      const response = await original(input, init)
      report({ type: 'request', transport: 'fetch', url: url.split('?')[0], method, status: response.status,
        requestType: response.ok ? 'done' : 'error', cost: performance.now() - started,
        reqBody: sanitizeBody(init.body), reqHeaders: '' })
      return response
    } catch (error) {
      report({ type: 'request', transport: 'fetch', url: url.split('?')[0], method, status: 0, requestType: 'error',
        cost: performance.now() - started, reqBody: '', reqHeaders: '' })
      throw error
    }
  }
}

const monitorErrors = () => {
  window.addEventListener('error', ((event: Event) => {
    if (event instanceof ErrorEvent) {
      report({ type: 'jsError', message: event.message, stack: event.error?.stack || event.message,
        filename: event.filename, lineno: event.lineno, colno: event.colno })
      return
    }
    const target = event.target as HTMLElement & { src?: string; href?: string }
    report({ type: 'loadResourceError', message: 'Resource load failed', stack: '',
      filename: target?.src || target?.href || '', lineno: 0, colno: 0 })
  }) as EventListener, true)
  window.addEventListener('unhandledrejection', event => {
    const reason = event.reason instanceof Error ? event.reason : new Error(String(event.reason))
    report({ type: 'jsError', message: reason.message, stack: reason.stack || reason.message,
      filename: window.location.href, lineno: 0, colno: 0 })
  })
}

export const startMonitor = () => {
  if ((window as any)[STARTED_KEY]) return
  ;(window as any)[STARTED_KEY] = true
  monitorRoutes()
  monitorPerformance()
  monitorXhr()
  monitorFetch()
  monitorErrors()
}
