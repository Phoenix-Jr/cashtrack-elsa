import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import ExcelJS from 'exceljs'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const getErrorMessage = (error: any): string => {
  if (error?.response?.data?.message) {
    if (Array.isArray(error.response.data.message)) {
      return error.response.data.message.join(', ')
    }
    return error.response.data.message
  }
  
  if (error?.message) {
    return error.message
  }
  
  switch (error?.response?.status) {
    case 400:
      return 'Données invalides'
    case 401:
      return 'Non autorisé'
    case 403:
      return 'Accès interdit'
    case 404:
      return 'Ressource introuvable'
    case 409:
      return 'Conflit - Cette ressource existe déjà'
    case 422:
      return 'Données non traitables'
    case 500:
      return 'Erreur serveur interne'
    default:
      return 'Une erreur inattendue est survenue'
  }
}

/**
 * Configuration pour une colonne d'export Excel
 */
export interface ExcelColumn {
  header: string
  key: string
  width?: number
  format?: (value: any) => string | number | boolean
}

/**
 * Options pour l'export Excel
 */
export interface ExcelExportOptions {
  fileName: string
  sheetName: string
  title: string
  columns: ExcelColumn[]
  data: any[]
  includeStats?: boolean
  statsData?: { label: string; value: string | number }[]
  includeTotals?: boolean
  totalsData?: { [key: string]: string | number }
  logoPath?: string
  period?: string
}

/**
 * Télécharge un fichier Excel à partir d'un buffer
 */
const downloadBuffer = (buffer: ArrayBuffer, fileName: string): void => {
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  })
  
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.style.display = 'none'
  a.href = url
  a.download = fileName
  document.body.appendChild(a)
  a.click()
  window.URL.revokeObjectURL(url)
  document.body.removeChild(a)
}

/**
 * Exporte des données vers Excel avec un design professionnel utilisant les couleurs de l'application
 * Couleurs principales: #0B177C (bleu) et #B8B8B8 (gris)
 */
export const exportToExcel = async (options: ExcelExportOptions): Promise<void> => {
  try {
    const { 
      fileName, 
      sheetName, 
      title, 
      columns, 
      data, 
      includeStats = true, 
      statsData = [],
      includeTotals = false,
      totalsData = {},
      logoPath = '/logo.png',
      period
    } = options
    
    // Créer un nouveau workbook
    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet(sheetName, {
      views: [{ state: 'frozen', xSplit: 0, ySplit: 4 }] // Figer les 4 premières lignes (logo + titre + stats + header)
    })

    // === LOGO ===
    let logoRowOffset = 0
    if (logoPath) {
      try {
        const logoResponse = await fetch(logoPath)
        if (logoResponse.ok) {
          const logoBuffer = await logoResponse.arrayBuffer()
          // Convertir ArrayBuffer en Uint8Array pour ExcelJS
          const uint8Array = new Uint8Array(logoBuffer)
          
          const imageId = workbook.addImage({
            buffer: uint8Array as any,
            extension: 'png',
          })
          
          // Ajouter le logo en haut à gauche (cellules A1, B1 et C1 - trois colonnes)
          worksheet.addImage(imageId, {
            tl: { col: 0, row: 0 },
            ext: { width: 240, height: 80 } // Largeur triplée pour trois colonnes
          })
          
          // Fusionner les cellules A1, B1 et C1 pour le logo
          worksheet.mergeCells(1, 1, 1, 3)
          
          // Ajuster la hauteur de la première ligne pour le logo
          worksheet.getRow(1).height = 80
          // Ajuster la largeur des trois premières colonnes pour le logo
          worksheet.getColumn(1).width = 20
          worksheet.getColumn(2).width = 20
          worksheet.getColumn(3).width = 20
          logoRowOffset = 1
        }
      } catch (error) {
        console.warn('Impossible de charger le logo:', error)
      }
    }

    // === EN-TÊTE PRINCIPAL GIGANTESQUE ===
    const titleRow = worksheet.getRow(1 + logoRowOffset)
    titleRow.height = 45
    
    const titleCell = titleRow.getCell(1) // Toujours commencer à la colonne 1
    titleCell.value = title.toUpperCase()
    
    // Fusion pour le titre principal (commence à la colonne 1, même si logo présent)
    worksheet.mergeCells(1 + logoRowOffset, 1, 1 + logoRowOffset, columns.length)
    
    titleCell.font = {
      name: 'Calibri',
      size: 20,
      bold: true,
      color: { argb: 'FFFFFFFF' } // Blanc
    }
    titleCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF0B177C' } // Bleu principal #0B177C
    }
    titleCell.alignment = {
      horizontal: 'center',
      vertical: 'middle'
    }
    titleCell.border = {
      top: { style: 'thick', color: { argb: 'FFB8B8B8' } },
      bottom: { style: 'thick', color: { argb: 'FFB8B8B8' } },
      left: { style: 'thick', color: { argb: 'FFB8B8B8' } },
      right: { style: 'thick', color: { argb: 'FFB8B8B8' } }
    }

    // === LIGNE DE STATISTIQUES ===
    const statsRow = worksheet.getRow(2 + logoRowOffset)
    statsRow.height = 30
    
    let statsText = `📊 Total: ${data.length} enregistrement(s) | Date d'export: ${new Date().toLocaleString('fr-FR')}`
    if (period) {
      statsText = `📊 Période: ${period} | Total: ${data.length} enregistrement(s) | Date d'export: ${new Date().toLocaleString('fr-FR')}`
    }
    const statsCell = statsRow.getCell(1) // Toujours commencer à la colonne 1
    statsCell.value = statsText
    
    // Fusion pour les stats (commence à la colonne 1, même si logo présent)
    worksheet.mergeCells(2 + logoRowOffset, 1, 2 + logoRowOffset, columns.length)
    
    statsCell.font = {
      name: 'Calibri',
      size: 14,
      bold: true,
      color: { argb: 'FF0B177C' } // Bleu principal
    }
    statsCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFF0F4FF' } // Bleu très clair
    }
    statsCell.alignment = {
      horizontal: 'center',
      vertical: 'middle'
    }
    statsCell.border = {
      top: { style: 'medium', color: { argb: 'FFB8B8B8' } },
      bottom: { style: 'medium', color: { argb: 'FFB8B8B8' } },
      left: { style: 'medium', color: { argb: 'FFB8B8B8' } },
      right: { style: 'medium', color: { argb: 'FFB8B8B8' } }
    }

    // === EN-TÊTE DES COLONNES ===
    const headerRow = worksheet.getRow(3 + logoRowOffset)
    headerRow.height = 40
    
    columns.forEach((column, index) => {
      // Toujours commencer à la colonne 1, même si logo présent
      const cell = headerRow.getCell(index + 1)
      
      // Gérer les en-têtes qui sont déjà en majuscules
      let headerText = column.header
      if (headerText !== headerText.toUpperCase()) {
        headerText = headerText.toUpperCase()
      }
      
      // Pour "EXPORTATEUR/FOURNISSEUR", ajouter un saut de ligne pour l'affichage sur deux lignes
      if (headerText.includes('EXPORTATEUR/FOURNISSEUR')) {
        headerText = 'EXPORTATEUR/FOURNIS\nSEUR'
      }
      
      cell.value = headerText
      
      cell.font = {
        name: 'Calibri',
        size: 12,
        bold: true,
        color: { argb: 'FFFFFFFF' }
      }
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF0B177C' } // Bleu principal
      }
      cell.alignment = {
        horizontal: 'center',
        vertical: 'middle',
        wrapText: true
      }
      cell.border = {
        top: { style: 'thick', color: { argb: 'FFB8B8B8' } },
        bottom: { style: 'thick', color: { argb: 'FFB8B8B8' } },
        left: { style: 'medium', color: { argb: 'FFB8B8B8' } },
        right: { style: 'medium', color: { argb: 'FFB8B8B8' } }
      }
      
      // Définir la largeur de colonne
      worksheet.getColumn(index + 1).width = column.width || 20
    })

    // === LIGNES DE DONNÉES ===
    const dataStartRow = 4 + logoRowOffset
    data.forEach((item, rowIndex) => {
      const row = worksheet.getRow(dataStartRow + rowIndex)
      row.height = 25
      
      columns.forEach((column, colIndex) => {
        // Toujours commencer à la colonne 1, même si logo présent
        const cell = row.getCell(colIndex + 1)
        const value = column.format ? column.format(item[column.key]) : item[column.key]
        cell.value = value ?? ''
        
        cell.font = {
          name: 'Calibri',
          size: 11,
          color: { argb: 'FF000000' }
        }
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: rowIndex % 2 === 0 ? 'FFFFFFFF' : 'FFF5F5F5' } // Alternance blanc/gris clair
        }
        cell.alignment = {
          horizontal: colIndex === 0 ? 'left' : 'center',
          vertical: 'middle',
          wrapText: true
        }
        cell.border = {
          top: { style: 'thin', color: { argb: 'FFB8B8B8' } },
          bottom: { style: 'thin', color: { argb: 'FFB8B8B8' } },
          left: { style: 'thin', color: { argb: 'FFB8B8B8' } },
          right: { style: 'thin', color: { argb: 'FFB8B8B8' } }
        }
      })
    })

    // === LIGNE DE TOTAUX ===
    if (includeTotals && Object.keys(totalsData).length > 0) {
      const totalsRowIndex = dataStartRow + data.length
      const totalsRow = worksheet.getRow(totalsRowIndex)
      totalsRow.height = 30
      
      columns.forEach((column, colIndex) => {
        // Toujours commencer à la colonne 1, même si logo présent
        const cell = totalsRow.getCell(colIndex + 1)
        const key = column.key
        
        // Si c'est la première colonne, mettre "TOTAL"
        if (colIndex === 0) {
          cell.value = 'TOTAL'
        } else if (totalsData[key] !== undefined) {
          cell.value = totalsData[key]
        } else {
          cell.value = ''
        }
        
        cell.font = {
          name: 'Calibri',
          size: 12,
          bold: true,
          color: { argb: 'FFFFFFFF' }
        }
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF0B177C' } // Bleu principal
        }
        cell.alignment = {
          horizontal: colIndex === 0 ? 'left' : 'center',
          vertical: 'middle',
          wrapText: true
        }
        cell.border = {
          top: { style: 'thick', color: { argb: 'FFB8B8B8' } },
          bottom: { style: 'thick', color: { argb: 'FFB8B8B8' } },
          left: { style: 'medium', color: { argb: 'FFB8B8B8' } },
          right: { style: 'medium', color: { argb: 'FFB8B8B8' } }
        }
      })
    }

    // === STATISTIQUES DANS LA MÊME FEUILLE (en bas) ===
    if (includeStats && statsData.length > 0) {
      // Calculer la ligne de départ pour les statistiques (après les données et les totaux)
      let statsStartRow = dataStartRow + data.length
      if (includeTotals && Object.keys(totalsData).length > 0) {
        statsStartRow += 1 // Ajouter une ligne vide après les totaux
      } else {
        statsStartRow += 1 // Ajouter une ligne vide après les données
      }
      
      // Ligne vide de séparation
      const separatorRow = worksheet.getRow(statsStartRow - 1)
      separatorRow.height = 10
      
      // Titre statistiques
      const statsTitleRow = worksheet.getRow(statsStartRow)
      statsTitleRow.height = 35
      const statsTitleCell = statsTitleRow.getCell(1)
      statsTitleCell.value = '📊 STATISTIQUES'
      worksheet.mergeCells(statsStartRow, 1, statsStartRow, 2)
      
      statsTitleCell.font = {
        name: 'Calibri',
        size: 18,
        bold: true,
        color: { argb: 'FFFFFFFF' }
      }
      statsTitleCell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF0B177C' } // Bleu principal
      }
      statsTitleCell.alignment = {
        horizontal: 'center',
        vertical: 'middle'
      }
      statsTitleCell.border = {
        top: { style: 'thick', color: { argb: 'FFB8B8B8' } },
        bottom: { style: 'thick', color: { argb: 'FFB8B8B8' } },
        left: { style: 'thick', color: { argb: 'FFB8B8B8' } },
        right: { style: 'thick', color: { argb: 'FFB8B8B8' } }
      }

      // Données statistiques
      statsData.forEach((stat, index) => {
        const row = worksheet.getRow(statsStartRow + 1 + index)
        row.height = 25
        
        const labelCell = row.getCell(1)
        labelCell.value = stat.label
        labelCell.font = { bold: true, size: 11, color: { argb: 'FF0B177C' } }
        labelCell.alignment = { horizontal: 'left', vertical: 'middle' }
        labelCell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: index % 2 === 0 ? 'FFFFFFFF' : 'FFF5F5F5' }
        }
        labelCell.border = {
          top: { style: 'thin', color: { argb: 'FFB8B8B8' } },
          bottom: { style: 'thin', color: { argb: 'FFB8B8B8' } },
          left: { style: 'thin', color: { argb: 'FFB8B8B8' } },
          right: { style: 'thin', color: { argb: 'FFB8B8B8' } }
        }
        
        const valueCell = row.getCell(2)
        valueCell.value = stat.value
        valueCell.font = { size: 11, color: { argb: 'FF0B177C' }, bold: true }
        valueCell.alignment = { horizontal: 'left', vertical: 'middle' }
        valueCell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: index % 2 === 0 ? 'FFFFFFFF' : 'FFF5F5F5' }
        }
        valueCell.border = {
          top: { style: 'thin', color: { argb: 'FFB8B8B8' } },
          bottom: { style: 'thin', color: { argb: 'FFB8B8B8' } },
          left: { style: 'thin', color: { argb: 'FFB8B8B8' } },
          right: { style: 'thin', color: { argb: 'FFB8B8B8' } }
        }
      })
      
      // Ajuster la largeur des colonnes de statistiques si nécessaire
      if (worksheet.getColumn(1).width < 30) {
        worksheet.getColumn(1).width = 30
      }
      if (worksheet.getColumn(2).width < 20) {
        worksheet.getColumn(2).width = 20
      }
    }

    // === GÉNÉRATION DU FICHIER ===
    const today = new Date()
    const dateStr = today.toISOString().split('T')[0]
    const finalFileName = `${fileName}_${dateStr}.xlsx`
    
    const buffer = await workbook.xlsx.writeBuffer()
    
    // Téléchargement
    downloadBuffer(buffer, finalFileName)
    
    console.log(`✅ Export Excel réussi: ${finalFileName} (${data.length} lignes)`)
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'export Excel:', error)
    throw error
  }
}

