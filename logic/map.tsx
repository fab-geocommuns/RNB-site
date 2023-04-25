export default class BuildingsMap {

    data:any;

    constructor(data: any) {
        this.data = data
    }

    clone() {
        return new BuildingsMap(this.data)
    }

}