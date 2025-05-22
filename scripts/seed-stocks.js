const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials. Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Stock and ETF data provided by client
const stocksData = [
  // US Stocks
  {
    ticker: 'AAPL',
    name: 'Apple',
    market: 'NASDAQ',
    is_compliant: true,
    about_stock: {
      type: 'stock',
      sector: 'Technology',
      industry: 'Consumer Electronics',
      description: 'Apple Inc. designs, manufactures, and markets smartphones, personal computers, tablets, wearables, and accessories worldwide.',
      metrics: {
        ncr: 0,
        ibd: 2.52,
        iba: 1.4
      }
    }
  },
  {
    ticker: 'NVDA',
    name: 'Nvidia',
    market: 'NASDAQ',
    is_compliant: true,
    about_stock: {
      type: 'stock',
      sector: 'Technology',
      industry: 'Semiconductors',
      description: 'NVIDIA Corporation provides graphics, and compute and networking solutions in the United States, Taiwan, China, and internationally.',
      metrics: {
        ncr: 1.35,
        ibd: 0.33,
        iba: 1.37
      }
    }
  },
  {
    ticker: 'TSLA',
    name: 'Tesla Inc.',
    market: 'NASDAQ',
    is_compliant: true,
    about_stock: {
      type: 'stock',
      sector: 'Consumer Cyclical',
      industry: 'Auto Manufacturers',
      description: 'Tesla, Inc. designs, develops, manufactures, leases, and sells electric vehicles, and energy generation and storage systems.',
      metrics: {
        ncr: 1.58,
        ibd: 1.05,
        iba: 2.85
      }
    }
  },
  {
    ticker: 'AVGO',
    name: 'Broadcom Inc.',
    market: 'NASDAQ',
    is_compliant: true,
    about_stock: {
      type: 'stock',
      sector: 'Technology',
      industry: 'Semiconductors',
      description: 'Broadcom Inc. designs, develops, and supplies various semiconductor devices worldwide.',
      metrics: {
        ncr: 0.89,
        ibd: 6.4,
        iba: 0.89
      }
    }
  },
  {
    ticker: 'TSM',
    name: 'Taiwan Semiconductor Manufacturing',
    market: 'NYSE',
    is_compliant: true,
    about_stock: {
      type: 'stock',
      sector: 'Technology',
      industry: 'Semiconductors',
      description: 'Taiwan Semiconductor Manufacturing Company Limited manufactures, packages, tests, and sells integrated circuits and other semiconductor devices.',
      metrics: {
        ncr: 2.71,
        ibd: 3.13,
        iba: 7.21
      }
    }
  },
  {
    ticker: 'V',
    name: 'Visa Holdings',
    market: 'NYSE',
    is_compliant: true,
    about_stock: {
      type: 'stock',
      sector: 'Financial Services',
      industry: 'Credit Services',
      description: 'Visa Inc. operates as a payments technology company worldwide.',
      metrics: {
        ncr: 0,
        ibd: 3.34,
        iba: 2.98
      }
    }
  },
  {
    ticker: 'MA',
    name: 'Mastercard',
    market: 'NYSE',
    is_compliant: true,
    about_stock: {
      type: 'stock',
      sector: 'Financial Services',
      industry: 'Credit Services',
      description: 'Mastercard Incorporated provides transaction processing and other payment-related products and services worldwide.',
      metrics: {
        ncr: 1.15,
        ibd: 3.94,
        iba: 1.92
      }
    }
  },
  {
    ticker: 'XOM',
    name: 'Exxon Mobil Corp.',
    market: 'NYSE',
    is_compliant: true,
    about_stock: {
      type: 'stock',
      sector: 'Energy',
      industry: 'Oil & Gas Integrated',
      description: 'Exxon Mobil Corporation explores for and produces crude oil and natural gas worldwide.',
      metrics: {
        ncr: 0,
        ibd: 10.32,
        iba: 4.95
      }
    }
  },
  {
    ticker: 'PG',
    name: 'Proctor & Gamble',
    market: 'NYSE',
    is_compliant: true,
    about_stock: {
      type: 'stock',
      sector: 'Consumer Defensive',
      industry: 'Household & Personal Products',
      description: 'The Procter & Gamble Company provides branded consumer packaged goods worldwide.',
      metrics: {
        ncr: 0.56,
        ibd: 8.82,
        iba: 2.6
      }
    }
  },
  {
    ticker: 'CSCO',
    name: 'Cisco Systems',
    market: 'NASDAQ',
    is_compliant: true,
    about_stock: {
      type: 'stock',
      sector: 'Technology',
      industry: 'Communication Equipment',
      description: 'Cisco Systems, Inc. designs, manufactures, and sells Internet Protocol based networking and other products related to the communications and information technology industry worldwide.',
      metrics: {
        ncr: 2.47,
        ibd: 13.1,
        iba: 7.42
      }
    }
  },
  {
    ticker: 'UPS',
    name: 'United Parcel Services',
    market: 'NYSE',
    is_compliant: true,
    about_stock: {
      type: 'stock',
      sector: 'Industrials',
      industry: 'Integrated Freight & Logistics',
      description: 'United Parcel Service, Inc. provides letter and package delivery, transportation, logistics, and financial services.',
      metrics: {
        ncr: 0,
        ibd: 23.82,
        iba: 5.87
      }
    }
  },
  {
    ticker: 'ADBE',
    name: 'Adobe Inc.',
    market: 'NASDAQ',
    is_compliant: true,
    about_stock: {
      type: 'stock',
      sector: 'Technology',
      industry: 'Software—Infrastructure',
      description: 'Adobe Inc. operates as a diversified software company worldwide.',
      metrics: {
        ncr: 1.56,
        ibd: 2.66,
        iba: 3.47
      }
    }
  },
  {
    ticker: 'DIS',
    name: 'Walt Disney',
    market: 'NYSE',
    is_compliant: false,
    about_stock: {
      type: 'stock',
      sector: 'Communication Services',
      industry: 'Entertainment',
      description: 'The Walt Disney Company, together with its subsidiaries, operates as an entertainment company worldwide.',
      metrics: {
        ncr: 14.33,
        ibd: 61.01,
        iba: 2.59
      }
    }
  },
  {
    ticker: 'AZN',
    name: 'AstraZeneca',
    market: 'NASDAQ',
    is_compliant: true,
    about_stock: {
      type: 'stock',
      sector: 'Healthcare',
      industry: 'Drug Manufacturers—General',
      description: 'AstraZeneca PLC discovers, develops, manufactures, and commercializes prescription medicines in the areas of oncology, cardiovascular, renal and metabolism, respiratory, infection, neuroscience, and gastroenterology worldwide.',
      metrics: {
        ncr: 0.62,
        ibd: 14.9,
        iba: 2.78
      }
    }
  },
  {
    ticker: 'QCOM',
    name: 'Qualcomm',
    market: 'NASDAQ',
    is_compliant: true,
    about_stock: {
      type: 'stock',
      sector: 'Technology',
      industry: 'Semiconductors',
      description: 'QUALCOMM Incorporated engages in the development and commercialization of foundational technologies for the wireless industry worldwide.',
      metrics: {
        ncr: 1.75,
        ibd: 8.38,
        iba: 8.23
      }
    }
  },
  {
    ticker: 'HNCYF',
    name: 'HSBC Holdings',
    market: 'NYSE',
    is_compliant: false,
    about_stock: {
      type: 'stock',
      sector: 'Financial Services',
      industry: 'Banks—Diversified',
      description: 'HSBC Holdings plc provides banking and financial services worldwide.',
      metrics: {
        ncr: 100,
        ibd: 259.86,
        iba: 1109.15
      }
    }
  },
  {
    ticker: 'VZ',
    name: 'Verizon Communications',
    market: 'NYSE',
    is_compliant: false,
    about_stock: {
      type: 'stock',
      sector: 'Communication Services',
      industry: 'Telecom Services',
      description: 'Verizon Communications Inc. offers communications, technology, information, and entertainment products and services to consumers, businesses, and governmental entities worldwide.',
      metrics: {
        ncr: 0.26,
        ibd: 100.01,
        iba: 2.68
      }
    }
  },
  {
    ticker: 'T',
    name: 'AT&T',
    market: 'NYSE',
    is_compliant: false,
    about_stock: {
      type: 'stock',
      sector: 'Communication Services',
      industry: 'Telecom Services',
      description: 'AT&T Inc. provides telecommunications, media, and technology services worldwide.',
      metrics: {
        ncr: 0,
        ibd: 88.41,
        iba: 2.06
      }
    }
  },
  {
    ticker: 'BLK',
    name: 'Blackrock Inc.',
    market: 'NYSE',
    is_compliant: false,
    about_stock: {
      type: 'stock',
      sector: 'Financial Services',
      industry: 'Asset Management',
      description: 'BlackRock, Inc. is a publicly owned investment manager.',
      metrics: {
        ncr: 91.36,
        ibd: 91.36,
        iba: 8.03
      }
    }
  },
  {
    ticker: 'NKE',
    name: 'Nike',
    market: 'NYSE',
    is_compliant: true,
    about_stock: {
      type: 'stock',
      sector: 'Consumer Cyclical',
      industry: 'Footwear & Accessories',
      description: 'NIKE, Inc., together with its subsidiaries, designs, develops, markets, and sells athletic footwear, apparel, equipment, and accessories worldwide.',
      metrics: {
        ncr: 0.83,
        ibd: 10.34,
        iba: 8.36
      }
    }
  },
  
  // LSE Stocks
  {
    ticker: '0R2V-LN',
    name: 'Apple',
    market: 'LSE',
    is_compliant: true,
    about_stock: {
      type: 'stock',
      sector: 'Technology',
      industry: 'Consumer Electronics',
      description: 'Apple Inc. designs, manufactures, and markets smartphones, personal computers, tablets, wearables, and accessories worldwide.',
      metrics: {
        ncr: 0,
        ibd: 2.52,
        iba: 1.4
      }
    }
  },
  {
    ticker: '0R1E-LN',
    name: 'Nintendo',
    market: 'LSE',
    is_compliant: true,
    about_stock: {
      type: 'stock',
      sector: 'Communication Services',
      industry: 'Electronic Gaming & Multimedia',
      description: 'Nintendo Co., Ltd., together with its subsidiaries, develops, manufactures, and distributes electronic entertainment products in Japan and internationally.',
      metrics: {
        ncr: 2.98,
        ibd: 0.44,
        iba: 19.97
      }
    }
  },
  {
    ticker: '0YXG-LN',
    name: 'Broadcom Inc.',
    market: 'LSE',
    is_compliant: true,
    about_stock: {
      type: 'stock',
      sector: 'Technology',
      industry: 'Semiconductors',
      description: 'Broadcom Inc. designs, develops, and supplies various semiconductor devices worldwide.',
      metrics: {
        ncr: 0.89,
        ibd: 6.4,
        iba: 0.89
      }
    }
  },
  
  // ETFs
  {
    ticker: 'SPUS',
    name: 'SP Funds S&P 500 Shariah Industry Exclusions ETF',
    market: 'US',
    is_compliant: true,
    about_stock: {
      type: 'etf',
      sector: 'Blend',
      industry: 'Large Cap',
      description: 'The SP Funds S&P 500 Sharia Industry Exclusions ETF seeks to track the performance of the S&P 500 Shariah Industry Exclusions Index.'
    }
  },
  {
    ticker: 'HLAL',
    name: 'Wahed FTSE USA Shariah ETF',
    market: 'US',
    is_compliant: true,
    about_stock: {
      type: 'etf',
      sector: 'Blend',
      industry: 'Large Cap',
      description: 'The Wahed FTSE USA Shariah ETF seeks to track the performance of the FTSE USA Shariah Index.'
    }
  },
  {
    ticker: 'SPSK',
    name: 'SP Funds Dow Jones Global Sukuk ETF',
    market: 'US',
    is_compliant: true,
    about_stock: {
      type: 'etf',
      sector: 'Fixed Income',
      industry: 'Global',
      description: 'The SP Funds Dow Jones Global Sukuk ETF seeks to track the performance of the Dow Jones Sukuk Total Return Index.'
    }
  },
  {
    ticker: 'UMMA',
    name: 'Wahed Dow Jones Islamic Word ETF',
    market: 'US',
    is_compliant: true,
    about_stock: {
      type: 'etf',
      sector: 'Blend',
      industry: 'Global',
      description: 'The Wahed Dow Jones Islamic World ETF seeks to track the performance of the Dow Jones Islamic Market International Titans 100 Index.'
    }
  },
  {
    ticker: 'SPRE',
    name: 'SP Funds S&P Global REIT Sharia ETF',
    market: 'US',
    is_compliant: true,
    about_stock: {
      type: 'etf',
      sector: 'Real Estate',
      industry: 'Global',
      description: 'The SP Funds S&P Global REIT Sharia ETF seeks to track the performance of the S&P Global REIT Shariah Index.'
    }
  },
  {
    ticker: 'ISWD',
    name: 'iShares MSCI World Islamic',
    market: 'UK',
    is_compliant: true,
    about_stock: {
      type: 'etf',
      sector: 'Blend',
      industry: 'Global',
      description: 'The iShares MSCI World Islamic ETF seeks to track the performance of the MSCI World Islamic Index.'
    }
  },
  {
    ticker: 'ISUS',
    name: 'Ishares MSCI USA Islamic',
    market: 'UK',
    is_compliant: true,
    about_stock: {
      type: 'etf',
      sector: 'Blend',
      industry: 'US Large Cap',
      description: 'The iShares MSCI USA Islamic ETF seeks to track the performance of the MSCI USA Islamic Index.'
    }
  },
  {
    ticker: 'IGDA',
    name: 'Invesco Dow Jones Islamic Global Developed Markets',
    market: 'UK',
    is_compliant: true,
    about_stock: {
      type: 'etf',
      sector: 'Blend',
      industry: 'Global Developed',
      description: 'The Invesco Dow Jones Islamic Global Developed Markets ETF seeks to track the performance of the Dow Jones Islamic Market Developed Markets Index.'
    }
  },
  {
    ticker: 'HIWO',
    name: 'HSBC MSCI World Islamic',
    market: 'UK',
    is_compliant: true,
    about_stock: {
      type: 'etf',
      sector: 'Blend',
      industry: 'Global',
      description: 'The HSBC MSCI World Islamic ETF seeks to track the performance of the MSCI World Islamic Index.'
    }
  }
];

const seedStocks = async () => {
  try {
    console.log('Starting to seed stocks table...');
    
    // Insert stocks in batches to avoid timeouts
    const batchSize = 5;
    for (let i = 0; i < stocksData.length; i += batchSize) {
      const batch = stocksData.slice(i, i + batchSize);
      
      const { error } = await supabase
        .from('stocks')
        .upsert(batch, { onConflict: 'ticker' });
      
      if (error) {
        console.error(`Error inserting batch ${Math.floor(i / batchSize) + 1}:`, error);
      } else {
        console.log(`Successfully inserted batch ${Math.floor(i / batchSize) + 1} (${batch.length} stocks)`);
      }
      
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    console.log('Stocks seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding stocks:', error);
  }
};

// Run the seed function
seedStocks()
  .then(() => {
    console.log('Seed script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Seed script failed:', error);
    process.exit(1);
  });
