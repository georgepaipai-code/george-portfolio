export interface FoodSpot {
  name: string;
  /** Neighborhood or city. */
  location: string;
  /** My go-to order, kept short. Optional. */
  order?: string;
  yelpUrl: string;
}

export interface FoodCategory {
  name: string;
  /**
   * Key into the icon map in FoodFavorites.tsx (e.g. "ramen", "boba").
   * Unrecognized or omitted keys fall back to a default icon - adding a
   * category never requires touching the component.
   */
  icon?: string;
  /** Sort order among categories, ascending. Omit to sort last. */
  order?: number;
  spots: FoodSpot[];
}

export const foodCategories: FoodCategory[] = [
  {
    name: "Ramen",
    icon: "ramen",
    order: 1,
    spots: [
      {
        name: "Hiro Nori",
        location: "San Mateo",
        order: "Pork Tonkatsu",
        yelpUrl: "https://www.yelp.com/biz/hironori-craft-ramen-san-mateo?osq=Hiro+Nori+Ramen",
      },
    ],
  },
  {
    name: "Boba",
    icon: "boba",
    order: 2,
    spots: [
      {
        name: "HeyTea",
        location: "San Francisco",
        order: "Grapefruit Bloom",
        yelpUrl: "https://www.yelp.com/biz/heytea-san-francisco?osq=Hey+Tea",
      },
    ],
  },
  {
    name: "Dim Sum",
    icon: "dimsum",
    order: 3,
    spots: [
      {
        name: "Ming's Tasty",
        location: "Oakland",
        order: "Lotus Leaf Sticky Rice",
        yelpUrl: "https://www.yelp.com/biz/mings-tasty-restaurant-oakland?osq=Ming%E2%80%99s+Tasty+Restaurant",
      },
    ],
  },
  {
    name: "Sandwiches",
    icon: "sandwiches",
    order: 4,
    spots: [
      {
        name: "Deli Board",
        location: "San Francisco",
        order: "Any Sandwich",
        yelpUrl: "https://www.yelp.com/biz/deli-board-san-francisco?osq=Deli+Board",
      },
    ],
  },
  {
    name: "Mexican",
    order: 5,
    spots: [
      {
        name: "La Taqueria",
        location: "San Francisco",
        order: "Carne Asada Burrito",
        yelpUrl: "https://www.yelp.com/biz/la-taqueria-san-francisco-2?osq=Mexican+Food",
      },
    ],
  },
  {
    name: "Pastries",
    icon: "pastries",
    order: 6,
    spots: [
      {
        name: "B Patisserie",
        location: "San Francisco",
        order: "Kouign Amann",
        yelpUrl: "https://www.yelp.com/biz/b-patisserie-san-francisco-2?osq=B+Patisserie",
      },
    ],
  },
];
