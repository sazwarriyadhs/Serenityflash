
'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import { allRestaurants } from '@/lib/restaurant-data';

export default function VendorMap() {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const restaurantsWithCoords = allRestaurants.filter(r => r.latitude && r.longitude);

  useEffect(() => {
    // Mencegah peta untuk diinisialisasi ulang jika sudah ada
    if (mapRef.current && !mapInstanceRef.current) {
      // @ts-ignore: Inisialisasi peta pada elemen ref
      mapInstanceRef.current = L.map(mapRef.current).setView([-6.59, 106.80], 12);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(mapInstanceRef.current);

      const restaurantIcon = new L.Icon({
        iconUrl: '/images/restopin.png',
        iconSize: [40, 40],
        iconAnchor: [20, 40],
        popupAnchor: [0, -40],
      });
      
      restaurantsWithCoords.forEach(resto => {
        const menuHtml = resto.menu?.map(item => `
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
            <span>${item.name}</span>
            <span style="font-weight: 500; white-space: nowrap; padding-left: 16px;">Rp ${item.price}</span>
          </div>
        `).join('') || '<p style="font-size: 0.9rem; color: #6b7280;">Menu belum tersedia.</p>';

        const popupContent = `
          <div style="font-family: sans-serif; max-width: 250px;">
            <h3 style="font-size: 1.1rem; font-weight: 700; margin: 0 0 4px 0;">${resto.name}</h3>
            <p style="font-size: 0.9rem; color: #6b7280; margin: 0 0 8px 0;">${resto.category}</p>
            <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 8px 0;" />
            <div style="font-size: 0.9rem; display: flex; flex-direction: column;">
              ${menuHtml}
            </div>
            <a 
              href="/restaurants/${resto.slug}" 
              style="margin-top: 12px; display: block; width: 100%; box-sizing: border-box; padding: 8px; background-color: #59B88D; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600; text-align: center; text-decoration: none;"
            >
              Lihat & Pesan
            </a>
          </div>
        `;
        // @ts-ignore: Menambahkan marker ke instance peta
        L.marker([resto.latitude, resto.longitude], { icon: restaurantIcon })
          .addTo(mapInstanceRef.current)
          .bindPopup(popupContent);
      });
    }

    // Fungsi pembersihan untuk menghancurkan instance peta saat komponen di-unmount
    return () => {
      if (mapInstanceRef.current) {
        // @ts-ignore: Menghapus instance peta
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []); // Array dependensi kosong memastikan efek ini hanya berjalan sekali setelah mount

  return (
    <div ref={mapRef} className="h-[500px] w-full rounded-lg shadow-xl" />
  );
}
