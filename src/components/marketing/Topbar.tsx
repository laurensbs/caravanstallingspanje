'use client';

import { MessageCircle, MapPin, Instagram, Facebook, Bot } from 'lucide-react';
import { useEffect, useState } from 'react';
import LocaleSwitch from '../LocaleSwitch';
import ChatBotModal from './ChatBotModal';

// Smalle navy-deep info-strip boven de hoofd-nav. Locatie + live weer
// links, chatbot + socials + taal rechts. Mail-link is weg (rommelig
// op smal-formaat) — klanten gebruiken WhatsApp of contact-form.

const WHATSAPP_HREF =
  'https://wa.me/34633778699?text=' +
  encodeURIComponent('Hallo, ik heb een vraag over caravanstalling.');

// Open-Meteo weather-codes → emoji + label. Klein subset; rest valt op
// een wolkje. Dekkingsbron: https://open-meteo.com/en/docs (codes 0-99).
function weatherEmoji(code: number): string {
  if (code === 0) return '☀️';
  if (code >= 1 && code <= 3) return '⛅';
  if (code === 45 || code === 48) return '🌫️';
  if (code >= 51 && code <= 67) return '🌦️';
  if (code >= 71 && code <= 77) return '❄️';
  if (code >= 80 && code <= 82) return '🌧️';
  if (code >= 95 && code <= 99) return '⛈️';
  return '☁️';
}

export default function Topbar() {
  const [chatOpen, setChatOpen] = useState(false);
  const [weather, setWeather] = useState<{ temp: number; code: number } | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/weather')
      .then((r) => r.ok ? r.json() : null)
      .then((d) => {
        if (cancelled || !d?.ok) return;
        setWeather({ temp: d.temp, code: d.code });
      })
      .catch(() => { /* stille fail — weer-pill verschijnt simpelweg niet */ });
    return () => { cancelled = true; };
  }, []);

  return (
    <>
      <div className="brand-topbar">
        <div className="tb-left">
          <span className="tb-location" aria-hidden>
            <MapPin size={12} /> Costa Brava · Sant Climent de Peralta
          </span>
          {weather && (
            <span
              className="tb-weather"
              aria-label={`Weer in Sant Climent: ${weather.temp} graden`}
              title={`Weer ter plaatse · ${weather.temp}°C`}
            >
              <span aria-hidden>{weatherEmoji(weather.code)}</span>
              <span className="tb-weather-temp">{weather.temp}°C</span>
            </span>
          )}
        </div>
        <div className="tb-right">
          <button
            type="button"
            onClick={() => setChatOpen(true)}
            className="tb-chat"
            aria-label="Open chat-assistent"
          >
            <Bot size={12} aria-hidden /> <span className="tb-chat-label">Chat</span>
          </button>
          <a
            href={WHATSAPP_HREF}
            target="_blank"
            rel="noopener noreferrer"
            className="tb-whatsapp"
            aria-label="WhatsApp"
          >
            <MessageCircle size={12} aria-hidden /> <span className="tb-whatsapp-label">WhatsApp</span>
          </a>
          <a
            href="https://www.facebook.com/caravanstallingspanje"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Facebook"
            className="tb-social"
          >
            <Facebook size={12} aria-hidden />
            <span className="tb-social-label hide-mobile">Facebook</span>
          </a>
          <a
            href="https://www.instagram.com/caravanstallingspanje"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
            className="tb-social"
          >
            <Instagram size={12} aria-hidden />
            <span className="tb-social-label hide-mobile">Instagram</span>
          </a>
          <span className="lang hide-mobile">
            <LocaleSwitch variant="dark" />
          </span>
        </div>
      </div>
      <ChatBotModal open={chatOpen} onClose={() => setChatOpen(false)} />
    </>
  );
}
