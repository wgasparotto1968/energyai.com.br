// Testa o extrator com o texto OCR real da fatura CELESC B1
import { extrairDadosFatura } from '../lib/analise/extrator.js'

const ocr = `RESIDENCIAL - RESIDENCIAL - B1 Residencial - MONOFÁSICO 6082530 28061757Cliente: 04/2026 08/05/2026 646,03R$ MARCIEL HAINZENREDER HERTZOGNOME: ***.760.900-**CPF/CNPJ: ALCINO DOS NAVEGANTES MOREIRA 728 - BARRA DO ARIRIU - PH ENDERECO: 88134-100CEP: PALHOCA SCCIDADE: BGrupo/Subgrupo Tensão: B1/ 16/03/2026 14/04/2026 29 14/05/2026 087617826NOTA FISCAL Nº 001SERIE: 14/04/2026DATA EMISSAO: PIS 398,88 0,35 1,39 COFINS 398,88 1,63 6,50 ICMS 120,97 12,00 14,52 ICMS 352,32 17,00 59,90 (0D) Consumo TE KWH 150,000 0,373200 55,98 0,97 55,98 12,00 6,72 0,321930 (0D) Consumo TE KWH 412,000 0,395728 163,04 2,68 163,04 17,00 27,72 0,321930 (0E) Consumo TUSD KWH 150,000 0,433267 64,99 1,13 64,99 12,00 7,80 0,373750 (0E) Consumo TUSD KWH 412,000 0,459417 189,28 3,11 189,28 17,00 32,18 0,373750 SUBTOTAL 473,29 (C0) COSIP Municipal 0,000 0,000000 85,13 TOTAL 646,03 MAR/26 FEV/26 JAN/26 DEZ/25 NOV/25 OUT/25 SET/25 AGO/25 JUL/25 JUN/25 MAI/25 ABR/25 MAR/25 CON GTP 581 0 557 0 703 0 442 0 470 0 440 0 428 0 426 0 478 0 422 0 448 0 430 0 0 0`

const result = extrairDadosFatura(ocr)
console.log('consumoKwh:', result.consumoKwh, '  (esperado: 562)')
console.log('valorTotal:', result.valorTotal)
console.log('grupo:', result.grupo, '/ subgrupo:', result.subgrupo)
console.log('nomeCliente:', result.nomeCliente)
