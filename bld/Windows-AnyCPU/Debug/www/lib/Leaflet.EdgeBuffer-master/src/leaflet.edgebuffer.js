(function(previousMethods){

if (typeof previousMethods === 'undefined') {
	// Defining previously that object allows you to use that plugin even if you have overridden L.map
	previousMethods = {
		_pxBoundsToTileRange: L.TileLayer.prototype._pxBoundsToTileRange // grid layer
	};
}

L.TileLayer.include({ //GridLayer
  _pxBoundsToTileRange: function (bounds) {
    var tileRange = previousMethods._pxBoundsToTileRange.apply(this, arguments);
    
    // Default is to not buffer edge tiles (edgeBufferTiles = 0).
    var edgeBufferTiles = this.options.edgeBufferTiles || 0;

    return new L.Bounds(
      tileRange.min.subtract([edgeBufferTiles, edgeBufferTiles]),
      tileRange.max.add([edgeBufferTiles, edgeBufferTiles]));
  }
});

})(window.leafletEdgeBufferPreviousMethods);
