import { assign, buildSelector } from '../helpers';
import { getExecutionContext } from '../execution_context';

/**
 * Alias for `fillable`, which works for inputs and HTML select menus.
 *
 * [See `fillable` for usage examples.](#fillable)
 *
 * @name selectable
 * @function
 *
 * @public
 *
 * @param {string} selector - CSS selector of the element to look for text
 * @param {Object} options - Additional options
 * @param {string} options.scope - Nests provided scope within parent's scope
 * @param {number} options.at - Reduce the set of matched elements to the one at the specified index
 * @param {boolean} options.resetScope - Override parent's scope
 * @param {String} options.testContainer - Context where to search elements in the DOM
 * @return {Descriptor}
 */

/**
 * Fills in an input matched by a selector.
 *
 * @example
 *
 * // <input value="">
 *
 * const page = PageObject.create({
 *   fillIn: PageObject.fillable('input')
 * });
 *
 * // result: <input value="John Doe">
 * page.fillIn('John Doe');
 *
 * @example
 *
 * // <div class="name">
 * //   <input value="">
 * // </div>
 * // <div class="last-name">
 * //   <input value= "">
 * // </div>
 *
 * const page = PageObject.create({
 *   fillInName: PageObject.fillable('input', { scope: '.name' })
 * });
 *
 * page.fillInName('John Doe');
 *
 * // result
 * // <div class="name">
 * //   <input value="John Doe">
 * // </div>
 *
 * @example
 *
 * // <div class="name">
 * //   <input value="">
 * // </div>
 * // <div class="last-name">
 * //   <input value= "">
 * // </div>
 *
 * const page = PageObject.create({
 *   scope: 'name',
 *   fillInName: PageObject.fillable('input')
 * });
 *
 * page.fillInName('John Doe');
 *
 * // result
 * // <div class="name">
 * //   <input value="John Doe">
 * // </div>
 *
 * @example <caption>Filling different inputs with the same property</caption>
 *
 * // <input id="name">
 * // <input name="lastname">
 * // <input data-test="email">
 * // <textarea aria-label="address">
 * // <input placeholder="phone">
 *
 * const page = create({
 *   fillIn: fillable('input')
 * });
 *
 * page
 *   .fillIn('name', 'Doe')
 *   .fillIn('lastname', 'Doe')
 *   .fillIn('email', 'john@doe')
 *   .fillIn('address', 'A street')
 *   .fillIn('phone', '555-000');
 *
 * @public
 *
 * @param {string} selector - CSS selector of the element to look for text
 * @param {Object} options - Additional options
 * @param {string} options.scope - Nests provided scope within parent's scope
 * @param {number} options.at - Reduce the set of matched elements to the one at the specified index
 * @param {boolean} options.resetScope - Override parent's scope
 * @param {String} options.testContainer - Context where to search elements in the DOM
 * @return {Descriptor}
 */
export function fillable(selector, userOptions = {}) {
  return {
    isDescriptor: true,

    get(key) {
      return function(textOrClue, text) {
        let clue;

        if (text === undefined) {
          text = textOrClue;
        } else {
          clue = textOrClue;
        }

        let executionContext = getExecutionContext(this);
        let options = assign({ pageObjectKey: `${key}()` }, userOptions);

        return executionContext.runAsync((context) => {
          let fullSelector = buildSelector(this, selector, options);

          if (clue) {
            fullSelector = ['input', 'textarea', 'select']
              .map((tag) => [
                `${fullSelector} ${tag}[data-test="${clue}"]`,
                `${fullSelector} ${tag}[aria-label="${clue}"]`,
                `${fullSelector} ${tag}[placeholder="${clue}"]`,
                `${fullSelector} ${tag}[name="${clue}"]`,
                `${fullSelector} ${tag}#${clue}`
              ])
              .reduce((total, other) => total.concat(other), [])
              .join(',');
          }

          context.assertElementExists(fullSelector, options);

          context.fillIn(fullSelector, options.testContainer, text);
        });
      };
    }
  };
}
