import { AdMob } from '@capacitor-community/admob';
import { Capacitor } from '@capacitor/core';

const INTERSTITIAL_ID = 'ca-app-pub-9199449066843163/5972741273'; // tu unidad
let gamesSinceAd = 0;

export async function initAds() {
  if (!Capacitor.isNativePlatform()) return;
  try {
    await AdMob.initialize({
      initializeForTesting: false // false cuando publiques
    });
  } catch (_) {}
}

/** Llamar en Game Over; muestra anuncio cada 3 partidas */
export async function maybeShowGameOverAd() {
  if (!Capacitor.isNativePlatform()) return;
  gamesSinceAd++;
  if (gamesSinceAd < 3) return;
  gamesSinceAd = 0;
  try {
    await AdMob.prepareInterstitial({
      adId: INTERSTITIAL_ID,
      isTesting: false // false en release
    });
    await AdMob.showInterstitial();
  } catch (_) {}
}