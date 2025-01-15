import {
  BUILDINGS_SOURCE_POINTS,
  BUILDINGS_SOURCE_SHAPES,
  LIST_BUILDINGS_LAYERS_POINT,
  LIST_BUILDINGS_LAYERS_SHAPE,
} from '@/components/map/useMapLayers';
import dotImg from '@/public/images/map/dot.png';
import polygonImg from '@/public/images/map/polygon.png';

export class BuildingSourceSwitcherControl {
  private _map: maplibregl.Map;
  private _container: HTMLElement;
  private _button: HTMLButtonElement;
  private _icon: HTMLImageElement;
  private _text: HTMLSpanElement;
  public _isShapesSource: boolean = false;

  constructor() {
    this._container = document.createElement('div');
    this._container.className = 'maplibregl-ctrl maplibregl-ctrl-group';
    this._container.setAttribute('data-testid', 'control-point-emprise');

    this._button = document.createElement('button');
    this._button.type = 'button';
    this._button.style.width = '7rem';
    this._button.style.display = 'flex';
    this._button.style.alignItems = 'center';
    this._button.style.justifyContent = 'center';
    this._button.className = 'source-switcher-btn';

    this._icon = document.createElement('img');
    this._icon.style.maxWidth = '70%';
    this._icon.style.maxHeight = '70%';
    this._icon.style.paddingRight = '0.5em';
    this._icon.src = this._isShapesSource ? dotImg.src : polygonImg.src;
    this._icon.className = 'source-icon';
    this._button.appendChild(this._icon);

    this._text = document.createElement('span');
    this._text.textContent = 'Polygone';
    this._text.style.fontWeight = '500';
    this._text.style.fontSize = '1.3em';
    this._button.appendChild(this._text);

    this._button.onclick = this._onClick.bind(this);

    this._container.appendChild(this._button);
  }

  onAdd(map: maplibregl.Map) {
    this._map = map;
    return this._container;
  }

  onRemove() {
    this._container.parentNode?.removeChild(this._container);
  }

  private _onClick() {
    const currentStyle = this._map.getStyle();
    const currentBuildingSource = !this._isShapesSource
      ? BUILDINGS_SOURCE_POINTS
      : BUILDINGS_SOURCE_SHAPES;
    const buildingSource = currentStyle.sources[currentBuildingSource];

    if (buildingSource && buildingSource.type === 'vector') {
      this._isShapesSource = !this._isShapesSource;
      this.updateStyles();
    }
  }

  public updateStyles() {
    const currentStyle = this._map.getStyle();
    const currentBuildingSource = !this._isShapesSource
      ? BUILDINGS_SOURCE_POINTS
      : BUILDINGS_SOURCE_SHAPES;
    const buildingSource = currentStyle.sources[currentBuildingSource];

    if (buildingSource && buildingSource.type === 'vector') {
      LIST_BUILDINGS_LAYERS_POINT.forEach((l) => {
        this._map.setLayoutProperty(
          l,
          'visibility',
          this._isShapesSource ? 'none' : 'visible',
        );
      });

      LIST_BUILDINGS_LAYERS_SHAPE.forEach((l) => {
        this._map.setLayoutProperty(
          l,
          'visibility',
          !this._isShapesSource ? 'none' : 'visible',
        );
      });

      this._icon.src = !this._isShapesSource ? polygonImg.src : dotImg.src;
      this._text.textContent = !this._isShapesSource ? 'Polygone' : 'Point';
      this._button.style.width = !this._isShapesSource ? '7rem' : '5rem';
    }
  }
}
