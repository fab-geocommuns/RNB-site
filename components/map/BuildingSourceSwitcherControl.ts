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
  public _isShapesSource: boolean = false;

  constructor() {
    this._container = document.createElement('div');
    this._container.className = 'maplibregl-ctrl maplibregl-ctrl-group';

    this._button = document.createElement('button');
    this._button.type = 'button';
    this._button.className = 'source-switcher-btn';

    this._icon = document.createElement('img');
    this._icon.style.maxWidth = '100%';
    this._icon.style.maxHeight = '100%';
    this._icon.src = this._isShapesSource ? polygonImg.src : dotImg.src;
    this._icon.className = 'source-icon';
    this._button.appendChild(this._icon);

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

      this._isShapesSource = !this._isShapesSource;
    }
  }
}
