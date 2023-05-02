import { json } from "stream/consumers";

export default class BuildingsMap {

    data:any;

    constructor(data: any) {
        this.data = data
    }

    clone() {
        
        const newData = JSON.parse(JSON.stringify(this.data))
        return new BuildingsMap(newData)


    }

}