// Helper function to generate random date within past 6 months
const randomDate = () => {
  const now = new Date();
  const sixMonthsAgo = new Date(now.setMonth(now.getMonth() - 6));
  const randomTime = sixMonthsAgo.getTime() + Math.random() * (Date.now() - sixMonthsAgo.getTime());
  return new Date(randomTime).toISOString();
};

export const defaultPhotos = [
  {
    id: '1',
    title: 'Golden Retriever Puppy',
    description: 'Adorable golden retriever puppy with big brown eyes',
    imageUrl: 'https://images.unsplash.com/photo-1633722715463-d30f4f325e24?auto=format&fit=crop&w=800&q=80',
    userId: null,
    isDefault: true,
    createdAt: randomDate()
  },
  {
    id: '2',
    title: 'Husky Puppy Playing',
    description: 'Energetic husky puppy with blue eyes',
    imageUrl: 'https://images.unsplash.com/photo-1568572933382-74d440642117?auto=format&fit=crop&w=800&q=80',
    userId: null,
    isDefault: true,
    createdAt: randomDate()
  },
  {
    id: '3',
    title: 'Beagle Puppy',
    description: 'Cute beagle puppy with floppy ears',
    imageUrl: 'https://images.unsplash.com/photo-1505628346881-b72b27e84530?auto=format&fit=crop&w=800&q=80',
    userId: null,
    isDefault: true,
    createdAt: randomDate()
  },
  {
    id: '4',
    title: 'Labrador Puppy',
    description: 'Sweet yellow labrador puppy',
    imageUrl: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&w=800&q=80',
    userId: null,
    isDefault: true,
    createdAt: randomDate()
  },
  {
    id: '5',
    title: 'Corgi Puppy',
    description: 'Fluffy corgi puppy with short legs',
    imageUrl: 'https://images.unsplash.com/photo-1612536024345-ba0c96a1b688?auto=format&fit=crop&w=800&q=80',
    userId: null,
    isDefault: true,
    createdAt: randomDate()
  },
  {
    id: '6',
    title: 'Pomeranian Puppy',
    description: 'Tiny fluffy pomeranian puppy',
    imageUrl: 'https://images.unsplash.com/photo-1544568100-847a948585b9?auto=format&fit=crop&w=800&q=80',
    userId: null,
    isDefault: true,
    createdAt: randomDate()
  },
  {
    id: '7',
    title: 'German Shepherd Puppy',
    description: 'German shepherd puppy with pointy ears',
    imageUrl: 'https://images.unsplash.com/photo-1590005024662-41e2a2d66c4f?auto=format&fit=crop&w=800&q=80',
    userId: null,
    isDefault: true,
    createdAt: randomDate()
  },
  {
    id: '8',
    title: 'Dachshund Puppy',
    description: 'Long and low dachshund puppy',
    imageUrl: 'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?auto=format&fit=crop&w=800&q=80',
    userId: null,
    isDefault: true,
    createdAt: randomDate()
  },
  {
    id: '9',
    title: 'Pug Puppy',
    description: 'Wrinkly pug puppy with big eyes',
    imageUrl: 'https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=800&q=80',
    userId: null,
    isDefault: true,
    createdAt: randomDate()
  },
  {
    id: '10',
    title: 'Bulldog Puppy',
    description: 'Chunky english bulldog puppy',
    imageUrl: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=800&q=80',
    userId: null,
    isDefault: true,
    createdAt: randomDate()
  },
  {
    id: '11',
    title: 'Shiba Inu Puppy',
    description: 'Fluffy shiba inu puppy smiling',
    imageUrl: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=800&q=80',
    userId: null,
    isDefault: true,
    createdAt: randomDate()
  },
  {
    id: '12',
    title: 'Border Collie Puppy',
    description: 'Intelligent border collie puppy',
    imageUrl: 'https://images.unsplash.com/photo-1587402092301-725e37c70fd8?auto=format&fit=crop&w=800&q=80',
    userId: null,
    isDefault: true,
    createdAt: randomDate()
  },
  {
    id: '13',
    title: 'Australian Shepherd Puppy',
    description: 'Blue merle aussie puppy',
    imageUrl: 'https://images.unsplash.com/photo-1559123485-98c6f11b8cae?auto=format&fit=crop&w=800&q=80',
    userId: null,
    isDefault: true,
    createdAt: randomDate()
  },
  {
    id: '14',
    title: 'Samoyed Puppy',
    description: 'White fluffy samoyed puppy',
    imageUrl: 'https://images.unsplash.com/photo-1616794399573-ed8c1a610bde?auto=format&fit=crop&w=800&q=80',
    userId: null,
    isDefault: true,
    createdAt: randomDate()
  },
  {
    id: '15',
    title: 'French Bulldog Puppy',
    description: 'Small french bulldog puppy with bat ears',
    imageUrl: 'https://images.unsplash.com/photo-1583512603806-077998240c7a?auto=format&fit=crop&w=800&q=80',
    userId: null,
    isDefault: true,
    createdAt: randomDate()
  },
  {
    id: '16',
    title: 'Cocker Spaniel Puppy',
    description: 'Cocker spaniel puppy with long ears',
    imageUrl: 'https://images.unsplash.com/photo-1558788353-f76d92427f16?auto=format&fit=crop&w=800&q=80',
    userId: null,
    isDefault: true,
    createdAt: randomDate()
  },
  {
    id: '18',
    title: 'Dalmatian Puppy',
    description: 'Spotted dalmatian puppy',
    imageUrl: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=800&q=80',
    userId: null,
    isDefault: true,
    createdAt: randomDate()
  },
  {
    id: '19',
    title: 'Boxer Puppy',
    description: 'Playful boxer puppy',
    imageUrl: 'https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?auto=format&fit=crop&w=800&q=80',
    userId: null,
    isDefault: true,
    createdAt: randomDate()
  },
  {
    id: '20',
    title: 'Mixed Breed Puppy',
    description: 'Adorable mixed breed puppy',
    imageUrl: 'https://images.unsplash.com/photo-1477884213360-7e9d7dcc1e48?auto=format&fit=crop&w=800&q=80',
    userId: null,
    isDefault: true,
    createdAt: randomDate()
  },
  {
    id: '21',
    title: 'Chocolate Lab Puppy',
    description: 'Sweet chocolate labrador with soulful eyes',
    imageUrl: 'https://images.unsplash.com/photo-1561037404-61cd46aa615b?auto=format&fit=crop&w=800&q=80',
    userId: null,
    isDefault: true,
    createdAt: randomDate()
  },
  {
    id: '22',
    title: 'Bernese Mountain Dog Puppy',
    description: 'Large and lovable bernese puppy',
    imageUrl: 'https://images.unsplash.com/photo-1516371535707-512a1e83bb9a?auto=format&fit=crop&w=800&q=80',
    userId: null,
    isDefault: true,
    createdAt: randomDate()
  },
  {
    id: '23',
    title: 'Poodle Puppy',
    description: 'Curly haired poodle puppy',
    imageUrl: 'https://images.unsplash.com/photo-1527526029430-319f10814151?auto=format&fit=crop&w=800&q=80',
    userId: null,
    isDefault: true,
    createdAt: randomDate()
  },
  {
    id: '24',
    title: 'Maltese Puppy',
    description: 'Tiny white maltese puppy',
    imageUrl: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?auto=format&fit=crop&w=800&q=80',
    userId: null,
    isDefault: true,
    createdAt: randomDate()
  },
  {
    id: '25',
    title: 'Great Dane Puppy',
    description: 'Gentle giant great dane puppy',
    imageUrl: 'https://images.unsplash.com/photo-1588943211346-0908a1fb0b01?auto=format&fit=crop&w=800&q=80',
    userId: null,
    isDefault: true,
    createdAt: randomDate()
  },
  {
    id: '26',
    title: 'Chow Chow Puppy',
    description: 'Fluffy chow chow puppy with blue tongue',
    imageUrl: 'https://images.unsplash.com/photo-1591160690555-5debfba289f0?auto=format&fit=crop&w=800&q=80',
    userId: null,
    isDefault: true,
    createdAt: randomDate()
  },
  {
    id: '27',
    title: 'Saint Bernard Puppy',
    description: 'Gentle saint bernard puppy',
    imageUrl: 'https://images.unsplash.com/photo-1617470334257-68839a87c425?auto=format&fit=crop&w=800&q=80',
    userId: null,
    isDefault: true,
    createdAt: randomDate()
  },
  {
    id: '28',
    title: 'Chihuahua Puppy',
    description: 'Tiny chihuahua puppy with big personality',
    imageUrl: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&w=800&q=80',
    userId: null,
    isDefault: true,
    createdAt: randomDate()
  },
  {
    id: '29',
    title: 'Akita Puppy',
    description: 'Noble akita puppy',
    imageUrl: 'https://images.unsplash.com/photo-1568393691622-c7ba131d63b4?auto=format&fit=crop&w=800&q=80',
    userId: null,
    isDefault: true,
    createdAt: randomDate()
  },
  {
    id: '30',
    title: 'Cavalier King Charles Puppy',
    description: 'Sweet cavalier spaniel puppy',
    imageUrl: 'https://images.unsplash.com/photo-1583511666407-5f06533f2113?auto=format&fit=crop&w=800&q=80',
    userId: null,
    isDefault: true,
    createdAt: randomDate()
  },
  {
    id: '31',
    title: 'Boston Terrier Puppy',
    description: 'Tuxedo-wearing boston terrier puppy',
    imageUrl: 'https://images.unsplash.com/photo-1520087619250-584c0cbd35e8?auto=format&fit=crop&w=800&q=80',
    userId: null,
    isDefault: true,
    createdAt: randomDate()
  },
  {
    id: '32',
    title: 'Shetland Sheepdog Puppy',
    description: 'Miniature collie-like sheltie puppy',
    imageUrl: 'https://images.unsplash.com/photo-1548681528-6a5c45b66b42?auto=format&fit=crop&w=800&q=80',
    userId: null,
    isDefault: true,
    createdAt: randomDate()
  },
  {
    id: '33',
    title: 'Springer Spaniel Puppy',
    description: 'Energetic springer spaniel puppy',
    imageUrl: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=800&q=80',
    userId: null,
    isDefault: true,
    createdAt: randomDate()
  },
  {
    id: '34',
    title: 'Basenji Puppy',
    description: 'Barkless basenji puppy',
    imageUrl: 'https://images.unsplash.com/photo-1598133894008-61f7fdb8cc3a?auto=format&fit=crop&w=800&q=80',
    userId: null,
    isDefault: true,
    createdAt: randomDate()
  },
  {
    id: '35',
    title: 'Vizsla Puppy',
    description: 'Sleek hungarian vizsla puppy',
    imageUrl: 'https://images.unsplash.com/photo-1598134493042-f90f45dc63fd?auto=format&fit=crop&w=800&q=80',
    userId: null,
    isDefault: true,
    createdAt: randomDate()
  },
  {
    id: '36',
    title: 'Newfoundland Puppy',
    description: 'Gentle giant newfoundland puppy',
    imageUrl: 'https://images.unsplash.com/photo-1568572933382-74d440642117?auto=format&fit=crop&w=800&q=80',
    userId: null,
    isDefault: true,
    createdAt: randomDate()
  },
  {
    id: '37',
    title: 'Weimaraner Puppy',
    description: 'Silver weimaraner puppy with striking eyes',
    imageUrl: 'https://images.unsplash.com/photo-1623387641168-d9803ddd3f35?auto=format&fit=crop&w=800&q=80',
    userId: null,
    isDefault: true,
    createdAt: randomDate()
  },
  {
    id: '38',
    title: 'Papillon Puppy',
    description: 'Butterfly-eared papillon puppy',
    imageUrl: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?auto=format&fit=crop&w=800&q=80',
    userId: null,
    isDefault: true,
    createdAt: randomDate()
  },
  {
    id: '39',
    title: 'Bichon Frise Puppy',
    description: 'Fluffy white bichon frise puppy',
    imageUrl: 'https://images.unsplash.com/photo-1583512603806-077998240c7a?auto=format&fit=crop&w=800&q=80',
    userId: null,
    isDefault: true,
    createdAt: randomDate()
  },
  {
    id: '40',
    title: 'Miniature Schnauzer Puppy',
    description: 'Bearded mini schnauzer puppy',
    imageUrl: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&w=800&q=80',
    userId: null,
    isDefault: true,
    createdAt: randomDate()
  },
  {
    id: '41',
    title: 'Labradoodle Puppy',
    description: 'Curly labradoodle designer breed puppy',
    imageUrl: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&w=800&q=80',
    userId: null,
    isDefault: true,
    createdAt: randomDate()
  },
  {
    id: '42',
    title: 'Pembroke Welsh Corgi Puppy',
    description: 'Short-legged corgi puppy with big ears',
    imageUrl: 'https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?auto=format&fit=crop&w=800&q=80',
    userId: null,
    isDefault: true,
    createdAt: randomDate()
  },
  {
    id: '43',
    title: 'Jack Russell Terrier Puppy',
    description: 'Energetic jack russell puppy',
    imageUrl: 'https://images.unsplash.com/photo-1477884213360-7e9d7dcc1e48?auto=format&fit=crop&w=800&q=80',
    userId: null,
    isDefault: true,
    createdAt: randomDate()
  },
  {
    id: '44',
    title: 'Yorkshire Terrier Puppy',
    description: 'Tiny yorkshire terrier puppy',
    imageUrl: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=800&q=80',
    userId: null,
    isDefault: true,
    createdAt: randomDate()
  },
  {
    id: '45',
    title: 'Cocker Spaniel Mix Puppy',
    description: 'Lovable cocker spaniel mix puppy',
    imageUrl: 'https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=800&q=80',
    userId: null,
    isDefault: true,
    createdAt: randomDate()
  },
  {
    id: '46',
    title: 'Golden Doodle Puppy',
    description: 'Fluffy goldendoodle puppy',
    imageUrl: 'https://images.unsplash.com/photo-1612536024345-ba0c96a1b688?auto=format&fit=crop&w=800&q=80',
    userId: null,
    isDefault: true,
    createdAt: randomDate()
  },
  {
    id: '47',
    title: 'Pitbull Puppy',
    description: 'Sweet pitbull puppy with blocky head',
    imageUrl: 'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?auto=format&fit=crop&w=800&q=80',
    userId: null,
    isDefault: true,
    createdAt: randomDate()
  },
  {
    id: '48',
    title: 'Mastiff Puppy',
    description: 'Massive mastiff puppy',
    imageUrl: 'https://images.unsplash.com/photo-1568572933382-74d440642117?auto=format&fit=crop&w=800&q=80',
    userId: null,
    isDefault: true,
    createdAt: randomDate()
  },
  {
    id: '49',
    title: 'Havanese Puppy',
    description: 'Silky havanese puppy',
    imageUrl: 'https://images.unsplash.com/photo-1633722715463-d30f4f325e24?auto=format&fit=crop&w=800&q=80',
    userId: null,
    isDefault: true,
    createdAt: randomDate()
  },
  {
    id: '50',
    title: 'Rescue Puppy',
    description: 'Adorable rescue puppy looking for forever home',
    imageUrl: 'https://images.unsplash.com/photo-1505628346881-b72b27e84530?auto=format&fit=crop&w=800&q=80',
    userId: null,
    isDefault: true,
    createdAt: randomDate()
  }
];
