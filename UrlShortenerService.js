/**
 * UrlShortenerService.js
 * Servicio para acortar URLs largas
 * 
 * Este módulo proporciona funcionalidad para acortar URLs largas
 * usando diferentes métodos disponibles en Google Apps Script.
 */

const UrlShortenerService = {

  /**
   * Acorta una URL usando TinyURL (servicio gratuito sin API key)
   * @param {string} longUrl - URL larga a acortar
   * @returns {string} URL acortada o URL original si falla
   */
  acortarUrl: function(longUrl) {
    try {
      // Intentar con TinyURL (no requiere API key)
      return this._acortarConTinyUrl(longUrl);
    } catch (error) {
      Logger.log('Error al acortar URL: ' + error.message);
      // Si falla, devolver la URL original
      return longUrl;
    }
  },

  /**
   * Acorta URL usando TinyURL API
   * @private
   * @param {string} longUrl - URL larga
   * @returns {string} URL acortada
   */
  _acortarConTinyUrl: function(longUrl) {
    try {
      const apiUrl = 'https://tinyurl.com/api-create.php?url=' + encodeURIComponent(longUrl);
      
      const response = UrlFetchApp.fetch(apiUrl, {
        method: 'get',
        muteHttpExceptions: true
      });
      
      const shortUrl = response.getContentText().trim();
      
      // Verificar que la respuesta sea válida
      if (shortUrl && shortUrl.indexOf('http') === 0) {
        return shortUrl;
      }
      
      throw new Error('Respuesta inválida de TinyURL');
    } catch (error) {
      throw new Error('Error en TinyURL: ' + error.message);
    }
  },

  /**
   * Acorta URL usando is.gd (alternativa gratuita)
   * @private
   * @param {string} longUrl - URL larga
   * @returns {string} URL acortada
   */
  _acortarConIsGd: function(longUrl) {
    try {
      const apiUrl = 'https://is.gd/create.php?format=simple&url=' + encodeURIComponent(longUrl);
      
      const response = UrlFetchApp.fetch(apiUrl, {
        method: 'get',
        muteHttpExceptions: true
      });
      
      const shortUrl = response.getContentText().trim();
      
      if (shortUrl && shortUrl.indexOf('http') === 0) {
        return shortUrl;
      }
      
      throw new Error('Respuesta inválida de is.gd');
    } catch (error) {
      throw new Error('Error en is.gd: ' + error.message);
    }
  },

  /**
   * Acorta URL con reintentos en múltiples servicios
   * @param {string} longUrl - URL larga
   * @returns {string} URL acortada o URL original
   */
  acortarUrlConReintentos: function(longUrl) {
    // Verificar que la URL sea válida
    if (!longUrl || longUrl.length < 10) {
      return longUrl;
    }
    
    // Determinar el servicio preferido según configuración
    const servicioPreferido = CONFIG.URL_SHORTENER.SERVICE || 'tinyurl';
    
    // Intentar con el servicio preferido primero
    try {
      if (servicioPreferido === 'isgd') {
        return this._acortarConIsGd(longUrl);
      } else {
        return this._acortarConTinyUrl(longUrl);
      }
    } catch (error) {
      Logger.log('Servicio preferido (' + servicioPreferido + ') falló: ' + error.message);
      
      // Si falla, intentar con el servicio alternativo
      try {
        if (servicioPreferido === 'isgd') {
          return this._acortarConTinyUrl(longUrl);
        } else {
          return this._acortarConIsGd(longUrl);
        }
      } catch (error2) {
        Logger.log('Servicio alternativo también falló: ' + error2.message);
        
        // Si ambos fallan, devolver URL original
        Logger.log('Usando URL original sin acortar');
        return longUrl;
      }
    }
  }
};
