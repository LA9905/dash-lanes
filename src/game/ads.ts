import { AdMob, MaxAdContentRating } from '@capacitor-community/admob';
import { Capacitor } from '@capacitor/core';

const INTERSTITIAL_ID = 'ca-app-pub-9199449066843163/5972741273';
let gamesSinceAd = 0;

export async function initAds() {
  if (!Capacitor.isNativePlatform()) return;
  try {
    await AdMob.initialize({
      initializeForTesting: false,
      maxAdContentRating: MaxAdContentRating.General, // Solo anuncios aptos para todos (G)
      tagForChildDirectedTreatment: true,             // Trata las solicitudes como dirigidas a niños (COPPA / Families)
      tagForUnderAgeOfConsent: true,               // Opcional, para menores en Europa
    });
  } catch (_) {}
}

/** Llamar en Game Over; muestra anuncio */
export async function maybeShowGameOverAd() {
  if (!Capacitor.isNativePlatform()) return;
  gamesSinceAd++;
  if (gamesSinceAd < 3) return;
  gamesSinceAd = 0;
  try {
    await AdMob.prepareInterstitial({
      adId: INTERSTITIAL_ID,
      isTesting: false,
    });
    await AdMob.showInterstitial();
  } catch (_) {}
}