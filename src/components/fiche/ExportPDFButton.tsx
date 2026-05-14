'use client'

import { useState } from 'react'
import type { Personnage } from '@/types'

export function ExportPDFButton({ personnage }: { personnage: Personnage }) {
  const [loading, setLoading] = useState(false)

  async function handleExport() {
    setLoading(true)
    try {
      // Import dynamique pour éviter le SSR
      const { jsPDF } = await import('jspdf')
      const d = personnage.data
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })

      // Couleurs
      const BG = '#0F0E17', PANEL = '#1A1828', GOLD = '#FAC775', PURPLE = '#534AB7'
      const TEXT = '#E8E6F0', TEXT2 = '#9B96B8', GREEN = '#22C97A', RED = '#D85A30'

      // Fond
      doc.setFillColor(15, 14, 23)
      doc.rect(0, 0, 210, 297, 'F')

      // Header
      doc.setFillColor(26, 24, 40)
      doc.roundedRect(8, 8, 194, 16, 3, 3, 'F')
      doc.setTextColor(201, 168, 76)
      doc.setFontSize(14)
      doc.setFont('helvetica', 'bold')
      doc.text('PARTITURA', 12, 18)
      doc.setTextColor(107, 101, 137)
      doc.setFontSize(7)
      doc.setFont('helvetica', 'normal')
      doc.text('DE FOI, DE GLOIRE ET DE SANG — FICHE DE PERSONNAGE', 55, 18)
      doc.setTextColor(127, 119, 221)
      doc.setFontSize(8)
      doc.text('FICHE DE PERSONNAGE', 198, 18, { align: 'right' })

      let y = 28

      // Identité
      doc.setFillColor(26, 24, 40)
      doc.roundedRect(8, y, 194, 18, 2, 2, 'F')
      doc.setTextColor(232, 230, 240)
      doc.setFontSize(13)
      doc.setFont('helvetica', 'bold')
      doc.text(personnage.nom, 12, y + 7)
      doc.setTextColor(155, 150, 184)
      doc.setFontSize(8)
      doc.setFont('helvetica', 'normal')
      doc.text(`${personnage.race} · ${d?.concept || ''}`, 12, y + 13)
      if (d?.origine) doc.text(d.origine, 12, y + 17)
      y += 22

      // Ressources
      const boxes = [
        { l: 'PV', v: String(d?.pv ?? '?'), c: [255, 144, 104] as [number,number,number] },
        { l: 'PM', v: String(d?.pm ?? '?'), c: [74, 158, 224] as [number,number,number] },
        { l: 'IA', v: String(d?.ia ?? '?'), c: [201, 168, 76] as [number,number,number] },
        { l: 'ID', v: String(d?.id_ ?? '?'), c: [34, 201, 122] as [number,number,number] },
        { l: 'Initiative', v: d ? `${d.initBase}+1d10` : '?', c: [127, 119, 221] as [number,number,number] },
        { l: 'Renommée', v: String(d?.renommee ?? '?'), c: [250, 199, 117] as [number,number,number] },
      ]
      const bw = 30, bh = 14
      boxes.forEach((b, i) => {
        const bx = 8 + i * (bw + 2.8)
        doc.setFillColor(34, 31, 53)
        doc.roundedRect(bx, y, bw, bh, 2, 2, 'F')
        doc.setDrawColor(...b.c)
        doc.setLineWidth(0.4)
        doc.roundedRect(bx, y, bw, bh, 2, 2, 'S')
        doc.setTextColor(155, 150, 184)
        doc.setFontSize(5.5)
        doc.setFont('helvetica', 'bold')
        doc.text(b.l.toUpperCase(), bx + bw/2, y + 4, { align: 'center' })
        doc.setTextColor(...b.c)
        doc.setFontSize(10)
        doc.text(b.v, bx + bw/2, y + 11, { align: 'center' })
      })
      y += 18

      // Caractéristiques
      const STATS = ['Corps','Agilité','Esprit','Volonté','Présence','Perception']
      const sw = 30
      doc.setFillColor(26, 24, 40)
      doc.roundedRect(8, y, 194, 6, 2, 2, 'F')
      doc.setTextColor(201, 168, 76)
      doc.setFontSize(7)
      doc.setFont('helvetica', 'bold')
      doc.text('CARACTÉRISTIQUES', 12, y + 4)
      y += 8
      STATS.forEach((s, i) => {
        const sx = 8 + i * (sw + 2.7)
        const val = d?.finalStats?.[s as keyof typeof d.finalStats] ?? '?'
        doc.setFillColor(34, 31, 53)
        doc.roundedRect(sx, y, sw, 12, 2, 2, 'F')
        doc.setTextColor(107, 101, 137)
        doc.setFontSize(5)
        doc.setFont('helvetica', 'bold')
        doc.text(s.toUpperCase(), sx + sw/2, y + 4, { align: 'center' })
        doc.setTextColor(232, 230, 240)
        doc.setFontSize(11)
        doc.setFont('helvetica', 'bold')
        doc.text(String(val), sx + sw/2, y + 10, { align: 'center' })
      })
      y += 16

      // Compétences
      doc.setFillColor(26, 24, 40)
      doc.roundedRect(8, y, 194, 6, 2, 2, 'F')
      doc.setTextColor(201, 168, 76)
      doc.setFontSize(7)
      doc.setFont('helvetica', 'bold')
      doc.text('COMPÉTENCES', 12, y + 4)
      y += 8
      doc.setFontSize(7)
      let cx = 8, cy = y
      d?.majorSkills?.forEach(sk => {
        const w = doc.getTextWidth(sk + ' +10') + 6
        if (cx + w > 200) { cx = 8; cy += 7 }
        doc.setFillColor(83, 74, 183)
        doc.roundedRect(cx, cy, w, 5.5, 1, 1, 'F')
        doc.setTextColor(255,255,255)
        doc.setFont('helvetica', 'bold')
        doc.text(`${sk} +10`, cx + 3, cy + 4)
        cx += w + 2
      })
      d?.minorSkills?.forEach(sk => {
        const w = doc.getTextWidth(sk + ' +5') + 6
        if (cx + w > 200) { cx = 8; cy += 7 }
        doc.setFillColor(34, 201, 122, 0.3)
        doc.roundedRect(cx, cy, w, 5.5, 1, 1, 'F')
        doc.setTextColor(34, 201, 122)
        doc.setFont('helvetica', 'normal')
        doc.text(`${sk} +5`, cx + 3, cy + 4)
        cx += w + 2
      })
      y = cy + 10

      // Voix
      if (d?.voiceName) {
        doc.setFillColor(26, 24, 40)
        doc.roundedRect(8, y, 194, 6, 2, 2, 'F')
        doc.setTextColor(201, 168, 76)
        doc.setFontSize(7)
        doc.setFont('helvetica', 'bold')
        doc.text('VOIX & MAGIE', 12, y + 4)
        y += 8
        doc.setFillColor(34, 31, 53)
        doc.roundedRect(8, y, 92, 10, 2, 2, 'F')
        doc.setTextColor(127, 119, 221)
        doc.setFontSize(7)
        doc.text('Voix Universelle', 12, y + 4)
        doc.setTextColor(155, 150, 184)
        doc.text(`Score : ${d.vUniv}`, 12, y + 9)
        doc.setFillColor(34, 31, 53)
        doc.roundedRect(104, y, 98, 10, 2, 2, 'F')
        doc.setTextColor(34, 201, 122)
        doc.text(d.voiceName, 108, y + 4)
        doc.setTextColor(155, 150, 184)
        doc.text(`Score : ${d.vSpec} · Seuil = ${d.vSpec}+${d.finalStats?.Esprit??30}−Diff`, 108, y + 9)
        y += 14
      }

      // Histoire
      if (d?.bio) {
        doc.setFillColor(26, 24, 40)
        doc.roundedRect(8, y, 194, 6, 2, 2, 'F')
        doc.setTextColor(201, 168, 76)
        doc.setFontSize(7)
        doc.setFont('helvetica', 'bold')
        doc.text('HISTOIRE', 12, y + 4)
        y += 8
        doc.setFillColor(34, 31, 53)
        doc.roundedRect(8, y, 194, 20, 2, 2, 'F')
        doc.setTextColor(155, 150, 184)
        doc.setFontSize(7)
        doc.setFont('helvetica', 'normal')
        const lines = doc.splitTextToSize(d.bio, 186)
        doc.text(lines.slice(0, 4), 12, y + 5)
        y += 24
      }

      // Footer formules
      doc.setTextColor(107, 101, 137)
      doc.setFontSize(5)
      doc.text(
        'IA mêlée = Corps+Comp−Fatigue·5−ArmIA · IA distance = Agilité+Tir · ID = (Corps+Agi)÷2+Déf+Bouclier · Seuil combat = 40+IA−ID (5–95) · Seuil sort = Voix+Esprit−Diff',
        105, 290, { align: 'center' }
      )

      doc.save(`${personnage.nom || 'personnage'}_partitura.pdf`)
    } catch (e) {
      console.error('Erreur PDF:', e)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button onClick={handleExport} disabled={loading}
      className="w-full py-3 rounded-xl font-semibold text-sm transition-all"
      style={{background:'rgba(201,168,76,.15)',color:'#FAC775',border:'1px solid rgba(201,168,76,.3)'}}>
      {loading ? 'Génération du PDF...' : '📄 Exporter en PDF'}
    </button>
  )
}
