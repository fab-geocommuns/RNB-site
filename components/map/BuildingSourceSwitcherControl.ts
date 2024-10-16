import {
  BUILDINGS_LAYER,
  BUILDINGS_LAYER_SHAPE,
  BUILDINGS_LAYER_SHAPE_FILL,
  BUILDINGS_SOURCE,
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
    this._button.style.width = '5rem';
    this._button.style.display = 'flex';
    this._button.style.alignItems = 'center';
    this._button.style.justifyContent = 'center';
    this._button.className = 'source-switcher-btn';

    this._icon = document.createElement('img');
    this._icon.style.maxWidth = '70%';
    this._icon.style.maxHeight = '70%';
    this._icon.style.paddingRight = '0.5em';
    this._icon.src = this._isShapesSource ? polygonImg.src : dotImg.src;
    this._icon.className = 'source-icon';
    this._button.appendChild(this._icon);

    this._text = document.createElement('span');
    this._text.textContent = 'Point';
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
    const buildingSource = currentStyle.sources[BUILDINGS_SOURCE];

    if (buildingSource && buildingSource.type === 'vector') {
      const newUrl = this._isShapesSource
        ? `${process.env.NEXT_PUBLIC_API_BASE}/tiles/{x}/{y}/{z}.pbf`
        : `${process.env.NEXT_PUBLIC_API_BASE}/tiles/shapes/{x}/{y}/{z}.pbf`;

      this._map.getSource(BUILDINGS_SOURCE)?.setTiles([newUrl]);
      this._map.setLayoutProperty(
        BUILDINGS_LAYER,
        'visibility',
        !this._isShapesSource ? 'none' : 'visible',
      );
      this._map.setLayoutProperty(
        BUILDINGS_LAYER_SHAPE,
        'visibility',
        this._isShapesSource ? 'none' : 'visible',
      );
      this._map.setLayoutProperty(
        BUILDINGS_LAYER_SHAPE_FILL,
        'visibility',
        this._isShapesSource ? 'none' : 'visible',
      );
      this._icon.src = this._isShapesSource ? dotImg.src : polygonImg.src;
      this._text.textContent = this._isShapesSource ? 'Point' : 'Emprise';
      this._button.style.width = this._isShapesSource ? '5rem' : '6rem';

      this._isShapesSource = !this._isShapesSource;
    }
  }
}
