import { AdMob, MaxAdContentRating } from '@capacitor-community/admob';
import { Capacitor } from '@capacitor/core';

const INTERSTITIAL_ID = 'ca-app-pub-9199449066843163/5972741273';
const STORAGE_KEY = 'games_since_ad';

export async function initAds() {
  if (!Capacitor.isNativePlatform()) return;
  try {
    await AdMob.initialize({
      initializeForTesting: false,
      maxAdContentRating: MaxAdContentRating.General,
      tagForChildDirectedTreatment: true,
      tagForUnderAgeOfConsent: true,
    });
  } catch (_) {}
}

/** Llamar SOLO en pantallas de Game Over / fin de partida */
export async function maybeShowGameOverAd() {
  if (!Capacitor.isNativePlatform()) return;

  let count = parseInt(localStorage.getItem(STORAGE_KEY) || '0', 10);
  count++;

  if (count < 2) {
    localStorage.setItem(STORAGE_KEY, count.toString());
    return;
  }

  // Mostrar anuncio y reiniciar
  localStorage.setItem(STORAGE_KEY, '0');

  try {
    await AdMob.prepareInterstitial({
      adId: INTERSTITIAL_ID,
      isTesting: false,
    });
    await AdMob.showInterstitial();
  } catch (_) {}
}