'use client';

import { Mail, MessageCircle, MapPin, Instagram, Facebook, Bot } from 'lucide-react';
import { useState } from 'react';
import LocaleSwitch from '../LocaleSwitch';
import ChatBotModal from './ChatBotModal';

// Smalle navy-deep info-strip boven de hoofd-nav. Login zat hier én in
// de header — login leeft nu alleen nog in de header (icon-knop bij CTA).
// Hier zit chatbot-trigger + sociale links + mail + taal.

const WHATSAPP_HREF =
  'https://wa.me/34633778699?text=' +
  encodeURIComponent('Hallo, ik heb een vraag over caravanstalling.');

export default function Topbar() {
  const [chatOpen, setChatOpen] = useState(false);
  return (
    <>
      <div className="brand-topbar">
        <div className="tb-left">
          <span className="tb-location" aria-hidden>
            <MapPin size={12} /> Costa Brava · Sant Climent de Peralta
          </span>
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
          <a href="mailto:info@caravanstalling-spanje.com" className="hide-mobile">
            <Mail size={12} aria-hidden /> info@caravanstalling-spanje.com
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
