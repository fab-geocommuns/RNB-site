export default class Ads {
    data: any;

    constructor(data: any) {
        this.data = data
    }

    
    isSaved() {
        return this.issue_number == undefined
    }
    
    get issue_number() {
        return this.data.issue_number
    }
    get insee_code() {
        return this.data.insee_code
    }
    get issue_date() {
        return this.data.issue_date
    }
    get buildings_operations() {
        return this.data.buildings_operations
    }
    get ops() {
        return this.data.buildings_operations
    }


    updateBdgOperation(op: string, rnb_id: string) {


        this.data.buildings_operations = this.data.buildings_operations.map((bdgop: any) => {
            if (bdgop.building.rnb_id == rnb_id) {
                bdgop.operation = op
            }
            return bdgop
        }
        )

    }

    toggleRnbId(rnbid: string) {

        console.log('toggleRnbId: ' + rnbid)

        if (this.hasRnbId(rnbid)) {
            this.removeRnbId(rnbid)
        } else {
            this.addRnbId(rnbid)
        }

    }

    hasRnbId(rnbid: string) {
            
            return this.data.buildings_operations.some((bdgop: any) => bdgop.building.rnb_id == rnbid)
    
    }

    removeRnbId(rnbid: string) {
        console.log('removeRnbId')
        this.data.buildings_operations = this.data.buildings_operations.filter((bdgop: any) => bdgop.building.rnb_id != rnbid)
    }

    addRnbId(rnbid: string) {
        console.log('addRnbId')
        this.data.buildings_operations.push({
            "building": {
                "rnb_id": rnbid,
            },
            "operation": "build"
        })
    }



    addNewBdg() {

        this.data.buildings_operations.push({
            "building": {
                "rnb_id": "new",
            },
            "operation": "build"
        })

    }

    clone() {

        return new Ads(this.data)

    }

}