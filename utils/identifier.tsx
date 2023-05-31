export function addDash(rnb_id: string) {

    if (rnb_id.length != 12) {
        throw new Error("Invalid rnb_id length")
    }

    return rnb_id.substring(0, 4) + "-" + rnb_id.substring(4, 8) + "-" + rnb_id.substring(8, 12)

}