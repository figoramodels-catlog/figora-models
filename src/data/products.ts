import type { Product } from '../types';

export const categories = [
'Figures',
'Busts',
'Mecha',
'Die-Cast',
'Dioramas'];


export const products: Product[] = [
{
  id: '1',
  productId: 'FM-1041',
  name: 'Shadow Samurai — 1/6 Scale',
  category: 'Figures',
  description:
  'Hand-finished resin samurai with fabric-wrapped armour, articulated katana grip and a weathered display base.',
  image: "/6c1312d0-4cf6-41e4-af21-45886f0b3005.jpg",

  available: true
},
{
  id: '2',
  productId: 'FM-1042',
  name: 'Orbit Walker Astronaut',
  category: 'Figures',
  description:
  'Matte white suit sculpt with etched panel detail and a cast rock base. Includes magnetic visor swap.',
  image: "/dea892cf-2fdf-4e8b-9e82-a7a6d5506bc1.jpg",

  available: true
},
{
  id: '3',
  productId: 'FM-1043',
  name: 'Wyrm Ascendant',
  category: 'Figures',
  description:
  'Large-scale coiled dragon with hand-laid scale texture, translucent wing membrane and a stone plinth.',
  image: "/82e2ade1-e9f5-456d-8301-023e4d44fa75.jpg",

  available: false
},
{
  id: '4',
  productId: 'FM-2011',
  name: 'The Hooded One — Display Bust',
  category: 'Busts',
  description:
  'Monochrome display bust on a turned black plinth. Deep cloth folds finished with a fine matte coat.',
  image: "/aa692c40-be88-4d58-ae78-b813a5efe1f7.jpg",

  available: true
},
{
  id: '5',
  productId: 'FM-3007',
  name: 'RH-08 Field Unit',
  category: 'Mecha',
  description:
  'Fully panel-lined mecha kit, pre-assembled and weathered. Poseable shoulders with a clip-on shield and rifle.',
  image: "/79ec755f-1577-41bc-994f-fc6219b7687f.jpg",

  available: true
},
{
  id: '6',
  productId: 'FM-4002',
  name: 'Midnight Coupe — 1/18',
  category: 'Die-Cast',
  description:
  'Die-cast classic coupe in matte black with chrome trim, opening doors and a detailed cabin interior.',
  image: "/d5f28fcf-8823-4356-a32a-86da3b942cdb.jpg",

  available: true
},
{
  id: '7',
  productId: 'FM-1055',
  name: 'Iron Vow Knight',
  category: 'Figures',
  description:
  'Full plate armour sculpt with a weathered steel finish and a two-handed greatsword swap part.',
  image: "/877c29e8-00aa-4431-9dc4-c577fa27d4e0.jpg",

  available: false
},
{
  id: '8',
  productId: 'FM-5003',
  name: 'Last Arch — Diorama',
  category: 'Dioramas',
  description:
  'Compact diorama on a fractured stone platform with a standing figure and a thin cast arch.',
  image: "/8b18dba0-e985-458c-87d0-79871f85127b.jpg",

  available: true
}];