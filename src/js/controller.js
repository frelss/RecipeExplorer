import * as model from './model.js';
import { MODAL_CLOSE_SEC } from './config.js';
import recipeView from './views/recipeView.js';
import searchView from './views/searchView.js';
import resultsView from './views/resultsView.js';
import paginationView from './views/paginationView.js';
import bookMarksView from './views/bookMarksView.js';
import AddRecipeView from './views/AddRecipeView.js';

import 'core-js/stable';
import 'regenerator-runtime/runtime';

// if (module.hot) {
//   module.hot.accept();
// }

const controlRecipes = async function () {
  try {
    const id = window.location.hash.slice(1);

    if (!id) return;
    recipeView.renderSpinner();

    //! 0) Update results view to mark selected search result
    resultsView.update(model.getSearchResultsPage());
    bookMarksView.update(model.state.bookmarks);

    //! 1) Loading recipe
    await model.loadRecipe(id);

    //! 2) Rendering recipe
    recipeView.render(model.state.recipe);
  } catch (err) {
    recipeView.renderError();
    console.error(err);
  }
};

const controlSearchResults = async () => {
  try {
    resultsView.renderSpinner();

    const query = searchView.getQuery();
    if (!query) return;

    await model.loadSearchResult(query);

    resultsView.render(model.getSearchResultsPage());

    // Render initial pagiantion buttons

    paginationView.render(model.state.search);
  } catch (err) {
    console.log(err);
  }
};

const controlPagination = goToPage => {
  resultsView.render(model.getSearchResultsPage(goToPage));
  paginationView.render(model.state.search);
};

const controlServings = newServings => {
  //Update recipe servings (in state)
  model.updateServings(newServings);

  //update the recipe view
  //recipeView.render(model.state.recipe);
  recipeView.update(model.state.recipe);
};

const controlAddBookmark = () => {
  if (!model.state.recipe.bookmarked) model.addBookmark(model.state.recipe);
  else model.deleteBookmark(model.state.recipe.id);

  recipeView.update(model.state.recipe);

  //Render
  bookMarksView.render(model.state.bookmarks);
};

const controlBookmarks = () => {
  bookMarksView.render(model.state.bookmarks);
};

const controlAddRecipe = async newRecipe => {
  try {
    //show loading spinner
    AddRecipeView.renderSpinner();

    //upload new recipe data
    await model.uploadRecipe(newRecipe);

    //Render
    recipeView.render(model.state.recipe);

    //Success message
    AddRecipeView.renderMessage();

    //render bookmark view
    bookMarksView.render(model.state.bookmarks);

    //change ID in history
    window.history.pushState(null, '', `#${model.state.recipe.id}`);

    //Close form window
    setTimeout(() => {
      AddRecipeView.toggleWindow();
    }, MODAL_CLOSE_SEC * 1000);
  } catch (err) {
    console.error(err);
    AddRecipeView.renderError(err.message);
  }
};

const init = () => {
  bookMarksView.addHandlerRender(controlBookmarks);
  recipeView.addHandlerRender(controlRecipes);
  recipeView.addHandlerUpdateServings(controlServings);
  recipeView.addHandlerAddBookmar(controlAddBookmark);
  searchView.addHandlerSearch(controlSearchResults);
  paginationView.addHandlerClick(controlPagination);
  AddRecipeView.addHandlerUpload(controlAddRecipe);
};
init();
