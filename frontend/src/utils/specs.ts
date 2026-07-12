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
  let fuelEconomy = '22 MPG City / 29 MPG Hwy';
  let warranty = '4 Year / 50,000 miles';
  
  if (modelLower.includes('taycan') || modelLower.includes('model') || modelLower.includes('i4') || modelLower.includes('e-tron')) {
    fuelType = 'Electric';
    transmission = 'Automatic';
    fuelEconomy = modelLower.includes('taycan') || modelLower.includes('plaid') ? '92 MPGe' : '115 MPGe';
  } else if (modelLower.includes('prime') || modelLower.includes('hybrid')) {
    fuelType = 'Plug-in Hybrid';
    transmission = 'Automatic';
    fuelEconomy = '38 MPG Combined';
  }

  // Transmission defaults
  if (modelLower.includes('dark horse') || modelLower.includes('supra') || modelLower.includes('m4')) {
    transmission = stableNum % 2 === 0 ? 'Manual' : 'Automatic';
  }

  // Horsepower & Torque
  let horsepower = 300;
  let torque = 280;
  
  if (modelLower.includes('plaid')) {
    horsepower = 1020;
    torque = 1050;
  } else if (modelLower.includes('hellcat')) {
    horsepower = 797;
    torque = 707;
  } else if (modelLower.includes('911 carrera')) {
    horsepower = 473;
    torque = 420;
  } else if (modelLower.includes('taycan')) {
    horsepower = 590;
    torque = 626;
  } else if (modelLower.includes('corvette c8')) {
    horsepower = 495;
    torque = 470;
  } else if (modelLower.includes('amg gt')) {
    horsepower = 429;
    torque = 384;
  } else if (modelLower.includes('e-tron gt')) {
    horsepower = 637;
    torque = 612;
  } else if (modelLower.includes('m4 competition')) {
    horsepower = 503;
    torque = 479;
  } else if (modelLower.includes('dark horse')) {
    horsepower = 500;
    torque = 418;
  } else if (modelLower.includes('supra')) {
    horsepower = 382;
    torque = 368;
  } else if (modelLower.includes('model y')) {
    horsepower = 384;
    torque = 376;
  } else if (modelLower.includes('i4')) {
    horsepower = 536;
    torque = 586;
  } else if (modelLower.includes('mach-e')) {
    horsepower = 480;
    torque = 634;
  } else if (modelLower.includes('rav4')) {
    horsepower = 302;
    torque = 206;
  } else {
    horsepower = 240 + (stableNum % 150);
    torque = 220 + (stableNum % 150);
  }

  const year = 2024 + (stableNum % 2); // 2024, 2025
  const mileage = stableNum % 2 === 0 ? 0 : (stableNum % 3500) + 12;
  const rating = 4.7 + (stableNum % 4) * 0.1; // 4.7 to 5.0
  const reviewsCount = (stableNum % 35) + 15;
  
  // Featured state
  const isFeatured = price > 75000 || stableNum % 4 === 0;
  
  // Discount price
  const discountPrice = stableNum % 6 === 0 ? Math.round(price * 0.95) : undefined;

  // High quality default fallback images (All 100% full external car images)
  let images = [
    'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80', // Black Porsche 911
    'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=800&q=80', // Orange Corvette
    'https://images.unsplash.com/photo-1611245041359-338274716499?auto=format&fit=crop&w=800&q=80', // Blue Taycan
  ];

  if (modelLower.includes('taycan')) {
    images = [
      'https://images.unsplash.com/photo-1611245041359-338274716499?auto=format&fit=crop&w=800&q=80', // Blue Taycan side
      'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&w=800&q=80', // Yellow 911 front
      'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80', // Black Coupe
    ];
  } else if (modelLower.includes('911')) {
    images = [
      'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&w=800&q=80', // Yellow 911
      'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80', // Black 911
      'https://images.unsplash.com/photo-1611245041359-338274716499?auto=format&fit=crop&w=800&q=80', // Blue Taycan
    ];
  } else if (modelLower.includes('model y')) {
    images = [
      'https://images.unsplash.com/photo-1619767886558-efdc259cde1a?auto=format&fit=crop&w=800&q=80', // White Model Y
      'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=800&q=80', // Grey Tesla front
      'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=800&q=80', // Grey Model S
    ];
  } else if (modelLower.includes('model s')) {
    images = [
      'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=800&q=80', // Grey Model S
      'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=800&q=80', // Grey Tesla front
      'https://images.unsplash.com/photo-1619767886558-efdc259cde1a?auto=format&fit=crop&w=800&q=80', // White Model Y
    ];
  } else if (modelLower.includes('i4')) {
    images = [
      'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=800&q=80', // Blue BMW
      'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=800&q=80', // Black BMW
      'https://images.unsplash.com/photo-1556800572-1b8aeef2c54f?auto=format&fit=crop&w=800&q=80', // BMW Sports Coupe
    ];
  } else if (modelLower.includes('m4')) {
    images = [
      'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=800&q=80', // Black BMW
      'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=800&q=80', // Blue BMW
      'https://images.unsplash.com/photo-1556800572-1b8aeef2c54f?auto=format&fit=crop&w=800&q=80', // BMW Sports Coupe
    ];
  } else if (modelLower.includes('mach-e')) {
    images = [
      'https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?auto=format&fit=crop&w=800&q=80', // Blue Mach-E
      'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?auto=format&fit=crop&w=800&q=80', // Red Mustang
      'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=800&q=80', // Corvette C8
    ];
  } else if (modelLower.includes('mustang')) {
    images = [
      'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?auto=format&fit=crop&w=800&q=80', // Red Mustang
      'https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?auto=format&fit=crop&w=800&q=80', // Blue Mach-E
      'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80', // Black Porsche
    ];
  } else if (modelLower.includes('rav4')) {
    images = [
      'https://images.unsplash.com/photo-1616422285623-13ff0162193c?auto=format&fit=crop&w=800&q=80', // Toyota RAV4
      'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=800&q=80', // Supra
      'https://images.unsplash.com/photo-1619767886558-efdc259cde1a?auto=format&fit=crop&w=800&q=80', // Tesla Model Y
    ];
  } else if (modelLower.includes('supra')) {
    images = [
      'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=800&q=80', // Yellow Supra
      'https://images.unsplash.com/photo-1616422285623-13ff0162193c?auto=format&fit=crop&w=800&q=80', // Toyota RAV4
      'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=800&q=80', // Corvette C8
    ];
  } else if (modelLower.includes('corvette')) {
    images = [
      'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=800&q=80', // Orange Corvette
      'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80', // Porsche 911
      'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?auto=format&fit=crop&w=800&q=80', // Red Mustang
    ];
  } else if (modelLower.includes('e-tron gt')) {
    images = [
      'https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?auto=format&fit=crop&w=800&q=80', // Grey Audi e-tron
      'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=800&q=80', // Blue BMW
      'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=800&q=80', // Corvette C8
    ];
  } else if (modelLower.includes('q8')) {
    images = [
      'https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?auto=format&fit=crop&w=800&q=80', // Grey Audi e-tron
      'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=800&q=80', // Blue BMW
      'https://images.unsplash.com/photo-1616422285623-13ff0162193c?auto=format&fit=crop&w=800&q=80', // Toyota RAV4
    ];
  } else if (modelLower.includes('amg')) {
    images = [
      'https://images.unsplash.com/photo-1618843479619-f13505b36157?auto=format&fit=crop&w=800&q=80', // Green AMG GT
      'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80', // Porsche 911
      'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=800&q=80', // Black BMW
    ];
  } else if (modelLower.includes('hellcat') || modelLower.includes('charger')) {
    images = [
      'https://images.unsplash.com/photo-1618843479619-f13505b36157?auto=format&fit=crop&w=800&q=80', // Green AMG GT (using AMG GT as muscle coupe lookalike)
      'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=800&q=80', // Corvette C8
      'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?auto=format&fit=crop&w=800&q=80', // Red Mustang
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
