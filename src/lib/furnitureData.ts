import type { FurnitureAsset } from './types';

export const furnitureCategories = [
  'Sofas',
  'Chairs',
  'Tables',
  'Beds',
  'Plants',
  'Shelves',
  'Lamps',
  'Wall Decor',
  'Rugs',
] as const;

export const furnitureAssets: FurnitureAsset[] = [
  // Sofas (6)
  { id: 'sofa-1', name: 'Beige Linen Sofa', category: 'Sofas', src: '/furniture/sofas/sofa-1.png', defaultWidth: 320, defaultHeight: 180 },
  { id: 'sofa-2', name: 'Green Velvet Sofa', category: 'Sofas', src: '/furniture/sofas/sofa-2.png', defaultWidth: 320, defaultHeight: 180 },
  { id: 'sofa-3', name: 'Grey Fabric Sofa', category: 'Sofas', src: '/furniture/sofas/sofa-3.png', defaultWidth: 320, defaultHeight: 180 },
  { id: 'sofa-4', name: 'Camel Leather Sofa', category: 'Sofas', src: '/furniture/sofas/sofa-4.png', defaultWidth: 320, defaultHeight: 180 },
  { id: 'sofa-5', name: 'White Modern Sofa', category: 'Sofas', src: '/furniture/sofas/sofa-5.png', defaultWidth: 320, defaultHeight: 180 },
  { id: 'sofa-6', name: 'Navy Blue Sofa', category: 'Sofas', src: '/furniture/sofas/sofa-6.png', defaultWidth: 320, defaultHeight: 180 },

  // Chairs (6)
  { id: 'chair-1', name: 'Scandinavian Accent Chair', category: 'Chairs', src: '/furniture/chairs/chair-1.png', defaultWidth: 160, defaultHeight: 200 },
  { id: 'chair-2', name: 'Mid-Century Armchair', category: 'Chairs', src: '/furniture/chairs/chair-2.png', defaultWidth: 160, defaultHeight: 200 },
  { id: 'chair-3', name: 'Wingback Reading Chair', category: 'Chairs', src: '/furniture/chairs/chair-3.png', defaultWidth: 170, defaultHeight: 220 },
  { id: 'chair-4', name: 'Rattan Accent Chair', category: 'Chairs', src: '/furniture/chairs/chair-4.png', defaultWidth: 150, defaultHeight: 200 },
  { id: 'chair-5', name: 'Velvet Dining Chair', category: 'Chairs', src: '/furniture/chairs/chair-5.png', defaultWidth: 130, defaultHeight: 180 },
  { id: 'chair-6', name: 'Leather Club Chair', category: 'Chairs', src: '/furniture/chairs/chair-6.png', defaultWidth: 170, defaultHeight: 200 },

  // Tables (6)
  { id: 'table-1', name: 'Marble Coffee Table', category: 'Tables', src: '/furniture/tables/table-1.png', defaultWidth: 200, defaultHeight: 140 },
  { id: 'table-2', name: 'Oak Dining Table', category: 'Tables', src: '/furniture/tables/table-2.png', defaultWidth: 280, defaultHeight: 160 },
  { id: 'table-3', name: 'Glass Side Table', category: 'Tables', src: '/furniture/tables/table-3.png', defaultWidth: 120, defaultHeight: 120 },
  { id: 'table-4', name: 'Walnut Console Table', category: 'Tables', src: '/furniture/tables/table-4.png', defaultWidth: 200, defaultHeight: 100 },
  { id: 'table-5', name: 'Round Pedestal Table', category: 'Tables', src: '/furniture/tables/table-5.png', defaultWidth: 160, defaultHeight: 160 },
  { id: 'table-6', name: 'Rustic Wood Bench', category: 'Tables', src: '/furniture/tables/table-6.png', defaultWidth: 240, defaultHeight: 100 },

  // Beds (6)
  { id: 'bed-1', name: 'Luxury King Bed', category: 'Beds', src: '/furniture/beds/bed-1.png', defaultWidth: 340, defaultHeight: 240 },
  { id: 'bed-2', name: 'Minimalist Platform Bed', category: 'Beds', src: '/furniture/beds/bed-2.png', defaultWidth: 320, defaultHeight: 220 },
  { id: 'bed-3', name: 'Canopy Four Poster Bed', category: 'Beds', src: '/furniture/beds/bed-3.png', defaultWidth: 340, defaultHeight: 280 },
  { id: 'bed-4', name: 'Upholstered Queen Bed', category: 'Beds', src: '/furniture/beds/bed-4.png', defaultWidth: 320, defaultHeight: 230 },
  { id: 'bed-5', name: 'Wooden Sleigh Bed', category: 'Beds', src: '/furniture/beds/bed-5.png', defaultWidth: 320, defaultHeight: 220 },
  { id: 'bed-6', name: 'Twin Daybed', category: 'Beds', src: '/furniture/beds/bed-6.png', defaultWidth: 280, defaultHeight: 160 },

  // Plants (6)
  { id: 'plant-1', name: 'Fiddle Leaf Fig', category: 'Plants', src: '/furniture/plants/plant-1.png', defaultWidth: 120, defaultHeight: 240 },
  { id: 'plant-2', name: 'Monstera Plant', category: 'Plants', src: '/furniture/plants/plant-2.png', defaultWidth: 140, defaultHeight: 200 },
  { id: 'plant-3', name: 'Snake Plant', category: 'Plants', src: '/furniture/plants/plant-3.png', defaultWidth: 100, defaultHeight: 200 },
  { id: 'plant-4', name: 'Olive Tree', category: 'Plants', src: '/furniture/plants/plant-4.png', defaultWidth: 130, defaultHeight: 260 },
  { id: 'plant-5', name: 'Potted Succulent', category: 'Plants', src: '/furniture/plants/plant-5.png', defaultWidth: 80, defaultHeight: 80 },
  { id: 'plant-6', name: 'Bird of Paradise', category: 'Plants', src: '/furniture/plants/plant-6.png', defaultWidth: 130, defaultHeight: 250 },

  // Shelves (6)
  { id: 'shelf-1', name: 'Floating Wall Shelf', category: 'Shelves', src: '/furniture/shelves/shelf-1.png', defaultWidth: 180, defaultHeight: 120 },
  { id: 'shelf-2', name: 'Tall Bookshelf', category: 'Shelves', src: '/furniture/shelves/shelf-2.png', defaultWidth: 140, defaultHeight: 260 },
  { id: 'shelf-3', name: 'Ladder Shelf', category: 'Shelves', src: '/furniture/shelves/shelf-3.png', defaultWidth: 130, defaultHeight: 240 },
  { id: 'shelf-4', name: 'Cube Storage Unit', category: 'Shelves', src: '/furniture/shelves/shelf-4.png', defaultWidth: 180, defaultHeight: 180 },
  { id: 'shelf-5', name: 'Corner Shelving Unit', category: 'Shelves', src: '/furniture/shelves/shelf-5.png', defaultWidth: 160, defaultHeight: 240 },
  { id: 'shelf-6', name: 'Industrial Pipe Shelf', category: 'Shelves', src: '/furniture/shelves/shelf-6.png', defaultWidth: 150, defaultHeight: 200 },

  // Lamps (6)
  { id: 'lamp-1', name: 'Arc Floor Lamp', category: 'Lamps', src: '/furniture/lamps/lamp-1.png', defaultWidth: 100, defaultHeight: 260 },
  { id: 'lamp-2', name: 'Brass Table Lamp', category: 'Lamps', src: '/furniture/lamps/lamp-2.png', defaultWidth: 90, defaultHeight: 140 },
  { id: 'lamp-3', name: 'Ceramic Table Lamp', category: 'Lamps', src: '/furniture/lamps/lamp-3.png', defaultWidth: 90, defaultHeight: 150 },
  { id: 'lamp-4', name: 'Tripod Floor Lamp', category: 'Lamps', src: '/furniture/lamps/lamp-4.png', defaultWidth: 110, defaultHeight: 250 },
  { id: 'lamp-5', name: 'Pendant Light', category: 'Lamps', src: '/furniture/lamps/lamp-5.png', defaultWidth: 100, defaultHeight: 120 },
  { id: 'lamp-6', name: 'Wall Sconce', category: 'Lamps', src: '/furniture/lamps/lamp-6.png', defaultWidth: 80, defaultHeight: 120 },

  // Wall Decor (6)
  { id: 'decor-1', name: 'Framed Abstract Art', category: 'Wall Decor', src: '/furniture/walldecor/decor-1.png', defaultWidth: 160, defaultHeight: 200 },
  { id: 'decor-2', name: 'Gold Round Mirror', category: 'Wall Decor', src: '/furniture/walldecor/decor-2.png', defaultWidth: 140, defaultHeight: 140 },
  { id: 'decor-3', name: 'Gallery Frame Set', category: 'Wall Decor', src: '/furniture/walldecor/decor-3.png', defaultWidth: 200, defaultHeight: 180 },
  { id: 'decor-4', name: 'Woven Wall Hanging', category: 'Wall Decor', src: '/furniture/walldecor/decor-4.png', defaultWidth: 130, defaultHeight: 200 },
  { id: 'decor-5', name: 'Vintage Wall Clock', category: 'Wall Decor', src: '/furniture/walldecor/decor-5.png', defaultWidth: 120, defaultHeight: 120 },
  { id: 'decor-6', name: 'Botanical Print', category: 'Wall Decor', src: '/furniture/walldecor/decor-6.png', defaultWidth: 120, defaultHeight: 170 },

  // Rugs (6)
  { id: 'rug-1', name: 'Persian Area Rug', category: 'Rugs', src: '/furniture/rugs/rug-1.png', defaultWidth: 320, defaultHeight: 220 },
  { id: 'rug-2', name: 'Jute Textured Rug', category: 'Rugs', src: '/furniture/rugs/rug-2.png', defaultWidth: 300, defaultHeight: 200 },
  { id: 'rug-3', name: 'Moroccan Trellis Rug', category: 'Rugs', src: '/furniture/rugs/rug-3.png', defaultWidth: 320, defaultHeight: 220 },
  { id: 'rug-4', name: 'Striped Runner Rug', category: 'Rugs', src: '/furniture/rugs/rug-4.png', defaultWidth: 300, defaultHeight: 120 },
  { id: 'rug-5', name: 'Shag Cream Rug', category: 'Rugs', src: '/furniture/rugs/rug-5.png', defaultWidth: 300, defaultHeight: 200 },
  { id: 'rug-6', name: 'Geometric Modern Rug', category: 'Rugs', src: '/furniture/rugs/rug-6.png', defaultWidth: 320, defaultHeight: 220 },
];

export function getAssetsByCategory(category: string): FurnitureAsset[] {
  return furnitureAssets.filter(a => a.category === category);
}
