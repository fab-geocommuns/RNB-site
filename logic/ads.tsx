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