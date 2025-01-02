import {
  BUILDINGS_LAYER_POINT,
  BUILDINGS_LAYER_SHAPE_BORDER,
  BUILDINGS_LAYER_SHAPE_FILL,
  BUILDINGS_LAYER_SHAPE_POINT,
  BUILDINGS_SOURCE,
} from '@/components/map/useMapLayers';
import { current } from 'immer';
import { webpack } from 'next/dist/compiled/webpack/webpack';

// Store
import { useDispatch, useSelector } from 'react-redux';
import { Actions, AppDispatch, RootState } from '@/stores/store';

export default class MapStyleSwitcherControl {
  constructor(options) {
    this._options = { ...options };

    this.initSwitcher();
    this.initContainer();
  }

  initSwitcher() {
    this._switcher = document.createElement('div');
    this._switcher.classList.add('maplibregl-ctrl-styles');

    const iconEl = document.createElement('i');
    iconEl.classList.add(this._options.icon);

    this._switcherLabel = document.createElement('span');
    this._switcherLabel.classList.add('maplibregl-ctrl-styles-label');

    const otherStyleKey = this.theOtherStyleKey(this._options.chosenStyle);
    this._switcherLabel.innerText = this._options.styles[otherStyleKey].name;

    this._switcher.appendChild(iconEl);
    this._switcher.appendChild(this._switcherLabel);
  }

  initContainer() {
    this._container = document.createElement('div');
    this._container.classList.add('maplibregl-ctrl');
    this._container.classList.add('maplibregl-ctrl-group');

    this._container.appendChild(this._switcher);
  }

  onAdd(map) {
    this._map = map;

    // Set default style
    this.setStyle(this._options.chosenStyle);

    this._switcher.addEventListener('click', () => {
      this.toggleStyle();
    });

    return this._container;
  }

  toggleStyle() {
    //this.dispatch(Actions.map.setLayersBackground('satellite'));
  }

  toggleStyleOLD() {
    const styleToSet = this.theOtherStyleKey(this._options.chosenStyle);
    this.setStyle(styleToSet);
  }

  setStyle(styleKey) {
    this._options.chosenStyle = styleKey;

    // On garde la source et la couche des bâtiments
    const currentStyle = this._map.getStyle();

    if (!currentStyle) {
      return;
    }

    const sourcesToKeep: Record<string, any> = {
      [BUILDINGS_SOURCE]: currentStyle?.sources[BUILDINGS_SOURCE],
      ads: currentStyle?.sources['ads'],
    };
    const layersToKeep = currentStyle?.layers.filter((l) =>
      [
        BUILDINGS_LAYER_POINT,
        BUILDINGS_LAYER_SHAPE_BORDER,
        BUILDINGS_LAYER_SHAPE_FILL,
        BUILDINGS_LAYER_SHAPE_POINT,
        'adscircle',
        'adsicon',
      ].includes(l.id),
    );

    // On duplique notre style pour ne pas modifier le style initial
    const newStyle = JSON.parse(
      JSON.stringify(this._options.styles[styleKey].style),
    );

    if (sourcesToKeep && layersToKeep) {
      for (const sourceId of Object.keys(sourcesToKeep))
        if (sourcesToKeep[sourceId])
          newStyle.sources[sourceId] = sourcesToKeep[sourceId];

      newStyle.layers.push(...layersToKeep);
    }

    this._map.setStyle(newStyle);

    const otherStyleKey = this.theOtherStyleKey(styleKey);

    this._switcherLabel.innerText = this._options.styles[otherStyleKey].name;
  }

  theOtherStyleKey(styleKey) {
    if (styleKey == 'satellite') {
      return 'vector';
    }

    if (styleKey == 'vector') {
      return 'satellite';
    }

    // throw error
    throw new Error('Unknown style key ' + styleKey);
  }

  onRemove() {
    this._container.parentNode?.removeChild(this._container);
  }
}
