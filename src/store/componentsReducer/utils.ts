import { ComponentInfoType } from "./index";
import { ComponentsStateType } from "./index";
export function getNextSelectedId(fe_id:string,componentList:ComponentInfoType[]){
    const visibleComponents = componentList.filter(c => !c.isHidden)
    const index = visibleComponents.findIndex(c=>c.fe_id===fe_id)
    if(index<0) return ''
    //重新计算selectedId
    let nextSelectedId = ''
    const length = visibleComponents.length
    if(length<=1) {nextSelectedId = ''}
    else{
        if(index===length-1) nextSelectedId = visibleComponents[index-1].fe_id
    
    else nextSelectedId = visibleComponents[index+1].fe_id
        }
    return nextSelectedId

}
export function insertNewComponent(componentList:ComponentsStateType,newComponent:ComponentInfoType){
    const {selectedId} = componentList
    const index = componentList.componentList.findIndex(c => c.fe_id === selectedId)
    if (index < 0) {
        componentList.componentList.push(newComponent)
      }

        else {
        componentList.componentList.splice(index + 1, 0, newComponent)

        }
        componentList.selectedId = newComponent.fe_id
          
}