import ReceptIngredients from './recept-ingredients';
import ReceptInstructions from './recept-instructions';
import ReceptMain from './recept-main';
import ReceptNutrition from './recept-nutrition';
import ReceptStocks from './recept-stocks';

export const steps = [
  {
    step: 1,
    title: 'recipe',
    content: ReceptMain,
  },
  {
    step: 2,
    title: 'instructions',
    content: ReceptInstructions,
  },
  {
    step: 3,
    title: 'ingredients',
    content: ReceptIngredients,
  },
  {
    step: 4,
    title: 'stocks',
    content: ReceptStocks,
  },
  {
    step: 5,
    title: 'nutritions',
    content: ReceptNutrition,
  },
];
