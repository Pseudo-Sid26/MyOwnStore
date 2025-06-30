require('dotenv').config();
const mongoose = require('mongoose');
const Category = require('./models/Category');
const Product = require('./models/Product');

const newCategories = [
  {
    name: 'Laptops',
    description: 'High-performance laptops for work and gaming',
    image: 'https://cdn.example.com/images/laptops.png'
  },
  {
    name: 'Mobiles',
    description: 'Latest smartphones with cutting-edge technology',
    image: 'https://cdn.example.com/images/mobiles.png'
  },
  {
    name: 'Clothing',
    description: 'Fashion and casual wear for all occasions',
    image: 'https://cdn.example.com/images/clothing.png'
  },
  {
    name: 'Books',
    description: 'Educational and entertainment books collection',
    image: 'https://cdn.example.com/images/books.png'
  }
];

async function addCategoriesAndProducts() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Add new categories
    const createdCategories = {};
    
    for (const categoryData of newCategories) {
      const existingCategory = await Category.findOne({ name: categoryData.name });
      if (existingCategory) {
        console.log(`Category "${categoryData.name}" already exists`);
        createdCategories[categoryData.name] = existingCategory;
      } else {
        const category = new Category(categoryData);
        await category.save();
        console.log(`Created category: ${category.name}`);
        createdCategories[categoryData.name] = category;
      }
    }

    // Get Electronics category
    const electronicsCategory = await Category.findOne({ name: 'Electronics' });
    if (electronicsCategory) {
      createdCategories['Electronics'] = electronicsCategory;
    }

    // Sample products for each category
    const sampleProducts = [
      // Laptops
      {
        title: 'MacBook Pro 16-inch M3',
        description: 'Apple MacBook Pro with M3 chip, perfect for professionals and creatives.',
        images: ['https://shorturl.at/laptop1', 'https://shorturl.at/laptop2'],
        brand: 'Apple',
        categoryId: createdCategories.Laptops._id,
        price: 249900,
        discount: { percentage: 5, validTill: new Date('2025-12-31') },
        stock: 15,
        tags: ['apple', 'macbook', 'professional', 'creative'],
        attributes: {
          processor: 'Apple M3 Pro',
          ram: '18GB',
          storage: '512GB SSD',
          screenSize: '16.2 inch',
          graphics: 'Apple GPU',
          batteryLife: '22 hours'
        },
        specifications: {
          weight: '2.16 kg',
          ports: ['3x Thunderbolt 4', 'HDMI', '3.5mm jack', 'SDXC'],
          wireless: ['Wi-Fi 6E', 'Bluetooth 5.3'],
          webcam: '1080p FaceTime HD'
        }
      },
      {
        title: 'Dell XPS 13 Plus',
        description: 'Ultra-portable laptop with stunning display and premium build quality.',
        images: ['https://shorturl.at/laptop3', 'https://shorturl.at/laptop4'],
        brand: 'Dell',
        categoryId: createdCategories.Laptops._id,
        price: 129900,
        discount: { percentage: 10, validTill: new Date('2025-11-30') },
        stock: 20,
        tags: ['dell', 'ultrabook', 'portable', 'business'],
        attributes: {
          processor: 'Intel i7-1360P',
          ram: '16GB',
          storage: '512GB SSD',
          screenSize: '13.4 inch',
          graphics: 'Intel Iris Xe',
          batteryLife: '12 hours'
        },
        specifications: {
          weight: '1.24 kg',
          ports: ['2x Thunderbolt 4'],
          wireless: ['Wi-Fi 6E', 'Bluetooth 5.2'],
          webcam: '720p HD'
        }
      },

      // Mobiles
      {
        title: 'iPhone 15 Pro Max',
        description: 'Latest iPhone with titanium design and advanced camera system.',
        images: ['https://shorturl.at/mobile1', 'https://shorturl.at/mobile2'],
        brand: 'Apple',
        categoryId: createdCategories.Mobiles._id,
        price: 159900,
        discount: { percentage: 3, validTill: new Date('2025-10-15') },
        stock: 30,
        tags: ['iphone', 'flagship', 'photography', 'premium'],
        attributes: {
          ram: '8GB',
          storage: '256GB',
          camera: '48MP Triple',
          battery: '4441 mAh',
          os: 'iOS 17',
          display: '6.7 inch OLED'
        },
        specifications: {
          processor: 'A17 Pro Bionic',
          network: '5G',
          colors: ['Natural Titanium', 'Blue Titanium', 'White Titanium', 'Black Titanium'],
          waterResistance: 'IP68'
        }
      },
      {
        title: 'Samsung Galaxy S24 Ultra',
        description: 'Premium Android flagship with S Pen and exceptional camera capabilities.',
        images: ['https://shorturl.at/mobile3', 'https://shorturl.at/mobile4'],
        brand: 'Samsung',
        categoryId: createdCategories.Mobiles._id,
        price: 139900,
        discount: { percentage: 8, validTill: new Date('2025-12-15') },
        stock: 25,
        tags: ['samsung', 'android', 's-pen', 'photography'],
        attributes: {
          ram: '12GB',
          storage: '512GB',
          camera: '200MP Quad',
          battery: '5000 mAh',
          os: 'Android 14',
          display: '6.8 inch Dynamic AMOLED'
        },
        specifications: {
          processor: 'Snapdragon 8 Gen 3',
          network: '5G',
          colors: ['Titanium Gray', 'Titanium Black', 'Titanium Violet', 'Titanium Yellow'],
          waterResistance: 'IP68'
        }
      },

      // Clothing
      {
        title: 'Levi\'s 511 Slim Jeans',
        description: 'Classic slim-fit jeans with comfortable stretch denim.',
        images: ['https://shorturl.at/clothing1', 'https://shorturl.at/clothing2'],
        brand: 'Levi\'s',
        categoryId: createdCategories.Clothing._id,
        price: 3999,
        discount: { percentage: 20, validTill: new Date('2025-09-30') },
        stock: 40,
        tags: ['jeans', 'casual', 'denim', 'men'],
        sizes: ['28', '30', '32', '34', '36', '38'],
        attributes: {
          material: '99% Cotton, 1% Elastane',
          fit: 'Slim',
          color: 'Dark Blue',
          style: 'Casual',
          care: 'Machine wash'
        },
        specifications: {
          rise: 'Mid-rise',
          closure: 'Zip fly',
          pockets: '5-pocket styling',
          length: 'Regular'
        }
      },
      {
        title: 'Nike Dri-FIT Running T-Shirt',
        description: 'Lightweight running t-shirt with moisture-wicking technology.',
        images: ['https://shorturl.at/clothing3', 'https://shorturl.at/clothing4'],
        brand: 'Nike',
        categoryId: createdCategories.Clothing._id,
        price: 1899,
        discount: { percentage: 15, validTill: new Date('2025-11-20') },
        stock: 60,
        tags: ['nike', 'running', 'sports', 'dri-fit'],
        sizes: ['S', 'M', 'L', 'XL', 'XXL'],
        attributes: {
          material: '100% Polyester',
          fit: 'Regular',
          color: 'Black',
          style: 'Athletic',
          technology: 'Dri-FIT'
        },
        specifications: {
          sleeve: 'Short sleeve',
          neckline: 'Crew neck',
          care: 'Machine wash',
          breathability: 'High'
        }
      },

      // Books
      {
        title: 'The Psychology of Money',
        description: 'Timeless lessons on wealth, greed, and happiness by Morgan Housel.',
        images: ['https://shorturl.at/book1', 'https://shorturl.at/book2'],
        brand: 'Harriman House',
        categoryId: createdCategories.Books._id,
        price: 599,
        discount: { percentage: 25, validTill: new Date('2025-08-31') },
        stock: 100,
        tags: ['finance', 'psychology', 'investment', 'self-help'],
        attributes: {
          author: 'Morgan Housel',
          pages: 256,
          genre: 'Finance & Economics',
          publisher: 'Harriman House',
          language: 'English',
          format: 'Paperback'
        },
        specifications: {
          isbn: '9780857197689',
          publishDate: '2020-09-08',
          dimensions: '19.8 x 12.9 x 1.8 cm',
          weight: '240g'
        }
      },
      {
        title: 'Clean Code: A Handbook',
        description: 'A handbook of agile software craftsmanship by Robert C. Martin.',
        images: ['https://shorturl.at/book3', 'https://shorturl.at/book4'],
        brand: 'Prentice Hall',
        categoryId: createdCategories.Books._id,
        price: 899,
        discount: { percentage: 20, validTill: new Date('2025-10-31') },
        stock: 50,
        tags: ['programming', 'software', 'coding', 'technical'],
        attributes: {
          author: 'Robert C. Martin',
          pages: 464,
          genre: 'Computer Science',
          publisher: 'Prentice Hall',
          language: 'English',
          format: 'Paperback'
        },
        specifications: {
          isbn: '9780132350884',
          publishDate: '2008-08-01',
          dimensions: '23.5 x 17.8 x 2.3 cm',
          weight: '750g'
        }
      }
    ];

    // Create products
    for (const productData of sampleProducts) {
      const existingProduct = await Product.findOne({ title: productData.title });
      if (existingProduct) {
        console.log(`Product "${productData.title}" already exists`);
      } else {
        const product = new Product(productData);
        await product.save();
        console.log(`Created product: ${product.title}`);
      }
    }

    console.log('\\n✅ Successfully added categories and products!');
    console.log('\\nSummary:');
    console.log('- Categories: Electronics, Laptops, Mobiles, Clothing, Books');
    console.log('- Products: 2 per new category + existing Electronics products');
    console.log('\\nEach category has unique attributes:');
    console.log('📱 Mobiles: RAM, storage, camera, battery, OS');
    console.log('💻 Laptops: Processor, RAM, storage, screen size, graphics');
    console.log('👕 Clothing: Material, fit, color, style, sizes');
    console.log('📚 Books: Author, pages, genre, publisher, format');

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

addCategoriesAndProducts();
