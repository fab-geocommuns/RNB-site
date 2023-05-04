export default class AdsEditing {
    state: any;

    constructor(state: any) {
        this.state = state

        this.buildBdgIdentifiers()

    }

    buildBdgIdentifiers() {

        this.state.data.buildings_operations.forEach((bdgop: any) => {

            if (bdgop.building.identifier == undefined) {
            
                if (bdgop.building.rnb_id == "new") {
                    bdgop.building.identifier = this.createNewBdgIdentifier()
                } else {
                    bdgop.building.identifier = bdgop.building.rnb_id
                }

            }
            
        })


    }

    updateNewBdgLngLat(lng: number, lat: number) {

        const op = this.state.data.buildings_operations.find((bdgop: any) => bdgop.building.identifier == this.state.bdg_move)
        if (op != undefined) {
            op.building.lat = lat
            op.building.lng = lng
        }
        

    }

    

    isEditingNewBdg() {
        return this.state.bdg_move != undefined || this.state.bdg_move == '';
    }
    
    isSaved() {
        return this.issue_number == undefined
    }
    
    get issue_number() {
        return this.state.data.issue_number
    }
    get insee_code() {
        return this.state.data.insee_code
    }
    get issue_date() {
        return this.state.data.issue_date
    }
    get buildings_operations() {
        return this.state.data.buildings_operations
    }
    get ops() {
        return this.state.data.buildings_operations
    }

    get newBdgOps() {

        const res = this.state.data.buildings_operations.filter((bdgop: any) => bdgop.building.rnb_id == "new")
        return res

    }

    setMovingBdg(identifier: string) {

        const op = this.state.data.buildings_operations.find((bdgop: any) => bdgop.building.identifier == identifier)
        if (op.building.rnb_id == "new") {
            this.state.bdg_move = identifier
            return
        }      

        throw new Error("Can't move an existing building")

    }

    createNewBdg() {
            
            this.data.buildings_operations.unshift({
                "building": {
                    "rnb_id": "new",
                    "identifier": this.createNewBdgIdentifier()
                },
                "operation": "build"
            })
    
    }

    createNewBdgIdentifier() {

            let length = 15;
            let result = '';
            const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
            const charactersLength = characters.length;
            let counter = 0;
            while (counter < length) {
              result += characters.charAt(Math.floor(Math.random() * charactersLength));
              counter += 1;
            }
            return "new-" + result;

    }


    updateBdgOperation(op: string, rnb_id: string) {

        this.state.data.buildings_operations = this.state.data.buildings_operations.map((bdgop: any) => {
            if (bdgop.building.rnb_id == rnb_id) {
                bdgop.operation = op
            }
            return bdgop
        }
        )

    }

    toggleRnbId(rnbid: string) {

        if (this.hasRnbId(rnbid)) {
            this.removeRnbId(rnbid)
        } else {
            this.addRnbId(rnbid)
        }

    }

    hasRnbId(rnbid: string) {
        return this.state.data.buildings_operations.some((bdgop: any) => bdgop.building.rnb_id == rnbid)    
    }

    removeRnbId(rnbid: string) {
        this.state.data.buildings_operations = this.state.data.buildings_operations.filter((bdgop: any) => bdgop.building.rnb_id != rnbid)
    }

    addBdg(rnbid: string) {

        let identifier = rnbid;
        if (rnbid == "new") {
            identifier = this.createNewBdgIdentifier()
        }

        const bdg = {
            "building": {
                "rnb_id": rnbid,
                "identifier": identifier
            },
            "operation": "build"
        }

        this.state.data.buildings_operations.unshift(bdg)

        return bdg

    }

    addRnbId(rnbid: string) {
        return this.addBdg(rnbid)
    }

    addNewBdg() {
        return this.addBdg("new")
    }

    clone() {

        return new AdsEditing(this.state)

    }

}