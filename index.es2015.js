"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.react2angular = void 0;
const fromPairs = require("lodash.frompairs");
const isFunction = require("lodash.isfunction");
const ngcomponent_1 = require("ngcomponent");
const React = require("react");
const react_dom_1 = require("react-dom");
/**
 * Wraps a React component in Angular. Returns a new Angular component.
 *
 * Usage:
 *
 *   ```ts
 *   type Props = { foo: number }
 *   class ReactComponent extends React.Component<Props, S> {}
 *   const AngularComponent = react2angular(ReactComponent, ['foo'])
 *   ```
 */
function react2angular(Class, bindingNames = null, injectNames = [], options = {}) {
    const names = bindingNames
        || (Class.propTypes && Object.keys(Class.propTypes))
        || [];
    return {
        bindings: fromPairs(names.map(_ => [_, '<'])),
        controller: ['$element', '$scope', ...injectNames, class extends ngcomponent_1.default {
                constructor($element, $scope, ...injectedProps) {
                    super();
                    this.$element = $element;
                    this.isDestroyed = false;
                    this.injectedProps = { $scope };
                    injectNames.forEach((name, i) => {
                        this.injectedProps[name] = injectedProps[i];
                    });
                }
                static get $$ngIsClass() {
                    return true;
                }
                render() {
                    if (!this.isDestroyed) {
                        let props = this.props;
                        if (options && (options.evalAsync || options.applyAsync)) {
                            props = wrapFunctionPropsToForceNgDigestCycle(this.injectedProps.$scope, this.props, options);
                        }
                        react_dom_1.render(React.createElement(Class, Object.assign({}, props, this.injectedProps)), this.$element[0]);
                    }
                }
                componentWillUnmount() {
                    this.isDestroyed = true;
                    react_dom_1.unmountComponentAtNode(this.$element[0]);
                }
            }]
    };
}
exports.react2angular = react2angular;
function wrapFunctionPropsToForceNgDigestCycle($scope, props, options) {
    return Object.keys(props)
        .reduce((wrappedProps, name) => {
        const prop = props[name];
        return Object.assign(Object.assign({}, wrappedProps), { [name]: isFunction(prop) ? (...args) => {
                prop(...args);
                if (options.evalAsync) {
                    $scope.$evalAsync();
                }
                else if (options.applyAsync) {
                    $scope.$applyAsync();
                }
            } : prop });
    }, {});
}
//# sourceMappingURL=index.js.map