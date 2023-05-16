export default class MapStyleSwitcherControl {

    constructor(options) {
        
        this._options = {...options}

        this.initSwitcher();
        this.initContainer();
      

    }

    initSwitcher() {
        
        this._switcher = document.createElement("div");
        this._switcher.classList.add("maplibregl-ctrl-styles");
        

        const iconEl = document.createElement("i");
        iconEl.classList.add(this._options.icon);

        this._switcherLabel = document.createElement("span");
        this._switcherLabel.classList.add("maplibregl-ctrl-styles-label");

        this._switcher.appendChild(iconEl);
        this._switcher.appendChild(this._switcherLabel);


    }

    initContainer() {

        this._container = document.createElement("div");
        this._container.classList.add("maplibregl-ctrl");
        this._container.classList.add("maplibregl-ctrl-group");

        this._container.appendChild(this._switcher);

    }
  
    onAdd(map) {

        this._map = map;

        

        // Set default style
        this.setStyle(this._options.chosenStyle);
        


        this._switcher.addEventListener("click", () => {
                this.toggleStyle();
        })


        return this._container;
    }

    toggleStyle() {

        const styleToSet = this.theOtherStyleKey(this._options.chosenStyle);
        this.setStyle(styleToSet);

    }

    setStyle(styleKey) {

        this._options.chosenStyle = styleKey;
        this._map.setStyle(this._options.styles[styleKey].style);

        const otherStyleKey = this.theOtherStyleKey(styleKey);


        
        this._switcherLabel.innerText = this._options.styles[otherStyleKey].name;
        


    }

    theOtherStyleKey(styleKey) {

        if (styleKey == "satellite") {
            return "vector";
        }

        if (styleKey == "vector") {
            return "satellite";
        }

        // throw error
        throw new Error("Unknown style key " + styleKey);

    }
  
    onRemove(){
      this._container.parentNode?.removeChild(this._container);
    }
  }
  