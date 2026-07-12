export interface VehicleExtendedSpecs {
  fuelType: 'Electric' | 'Plug-in Hybrid' | 'Gasoline';
  transmission: 'Automatic' | 'Manual';
  year: number;
  mileage: number;
  horsepower: number;
  torque: number;
  fuelEconomy: string;
  warranty: string;
  rating: number;
  reviewsCount: number;
  discountPrice?: number;
  isFeatured?: boolean;
  images: string[];
}

export const getVehicleExtendedSpecs = (_make: string, model: string, price: number, id: string): VehicleExtendedSpecs => {
  const modelLower = model.toLowerCase();
  
  // Use a simple hash code from the id to get stable deterministic values
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  const stableNum = Math.abs(hash);

  // Mapped details based on vehicle model
  let fuelType: 'Electric' | 'Plug-in Hybrid' | 'Gasoline' = 'Gasoline';
  let transmission: 'Automatic' | 'Manual' = 'Automatic';
  let fuelEconomy = '24 MPG City / 32 MPG Hwy';
  let warranty = '4 Year / 50,000 miles';
  
  if (modelLower.includes('taycan') || modelLower.includes('model y') || modelLower.includes('i4') || modelLower.includes('mach-e')) {
    fuelType = 'Electric';
    transmission = 'Automatic';
    fuelEconomy = modelLower.includes('taycan') ? '83 MPGe' : '122 MPGe';
  } else if (modelLower.includes('prime') || modelLower.includes('hybrid')) {
    fuelType = 'Plug-in Hybrid';
    transmission = 'Automatic';
    fuelEconomy = '38 MPG Combined';
  }

  // Horsepower & Torque
  let horsepower = 300;
  let torque = 280;
  if (modelLower.includes('taycan')) {
    horsepower = 402;
    torque = 254;
  } else if (modelLower.includes('model y')) {
    horsepower = 384;
    torque = 376;
  } else if (modelLower.includes('i4')) {
    horsepower = 282;
    torque = 295;
  } else if (modelLower.includes('mach-e')) {
    horsepower = 266;
    torque = 317;
  } else if (modelLower.includes('rav4')) {
    horsepower = 302;
    torque = 165;
  } else {
    horsepower = 200 + (stableNum % 300);
    torque = 180 + (stableNum % 250);
  }

  const year = 2023 + (stableNum % 3); // 2023, 2024, 2025
  const mileage = stableNum % 2 === 0 ? 0 : (stableNum % 12000) + 10;
  const rating = 4.5 + (stableNum % 6) * 0.1; // 4.5 to 5.0
  const reviewsCount = (stableNum % 45) + 5;
  
  // Featured state
  const isFeatured = price > 45000 || stableNum % 3 === 0;
  
  // Discount price
  const discountPrice = stableNum % 5 === 0 ? Math.round(price * 0.93) : undefined;

  // High quality automotive images from Unsplash
  let images = [
    'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1542282088-fe8426682b8f?auto=format&fit=crop&w=800&q=80',
  ];

  if (modelLower.includes('taycan')) {
    images = [
      'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1542282088-fe8426682b8f?auto=format&fit=crop&w=800&q=80',
    ];
  } else if (modelLower.includes('model y')) {
    images = [
      'https://images.unsplash.com/photo-1619767886558-efdc259cde1a?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&w=800&q=80',
    ];
  } else if (modelLower.includes('i4')) {
    images = [
      'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1542282088-fe8426682b8f?auto=format&fit=crop&w=800&q=80',
    ];
  } else if (modelLower.includes('mach-e')) {
    images = [
      'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1542282088-fe8426682b8f?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=800&q=80',
    ];
  }

  return {
    fuelType,
    transmission,
    year,
    mileage,
    horsepower,
    torque,
    fuelEconomy,
    warranty,
    rating,
    reviewsCount,
    discountPrice,
    isFeatured,
    images,
  };
};
