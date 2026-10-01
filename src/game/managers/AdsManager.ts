// 
/*
import { AdMob, InterstitialAdPluginEvents } from '@capacitor-community/admob';

export class AdsManager {
  static async init() {
    await AdMob.initialize();
  }

  static async showInterstitial() {
    try {
      await AdMob.prepareInterstitial({
        adId: 'ca-app-pub-xxxxxxxx/yyyyyyyy', // tu ID real
        isTesting: true // cambia a false en producción
      });
      await AdMob.showInterstitial();
    } catch (e) {
      console.log('No se pudo mostrar anuncio', e);
    }
  }
}
*/

// Versión temporal
export class AdsManager {
  static async showInterstitial() {
    console.log('Anuncio intersticial (placeholder)');
  }
}