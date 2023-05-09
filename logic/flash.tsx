import React from 'react';
import ReactDOM from "react-dom/client";
import FlashMessage from "@/components/FlashMessage";

export default class Flash {


    open: boolean;
    title: string;
    desc: string;
    type: string;
    closable: boolean;

    constructor() {
        this.open = false
        this.title = ""
        this.desc = ""
        this.type = "success"
        this.closable = true
    }

    openIt() {
        this.open = true
    }

 


       

}