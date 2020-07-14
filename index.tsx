import { IAugmentedJQuery, IComponentOptions, IRootScopeService } from 'angular'
import fromPairs = require('lodash.frompairs')
import isFunction = require('lodash.isfunction')
import NgComponent from 'ngcomponent'
import * as React from 'react'
import { render, unmountComponentAtNode } from 'react-dom'

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
export function react2angular<Props>(
  Class: React.ComponentType<Props>,
  bindingNames: (keyof Props)[] | null = null,
  injectNames: string[] = [],
  options: Options | undefined = {}
): IComponentOptions {
  const names = bindingNames
    || (Class.propTypes && Object.keys(Class.propTypes) as (keyof Props)[])
    || []

  return {
    bindings: fromPairs(names.map(_ => [_, '<'])),
    controller: ['$element', '$scope', ...injectNames, class extends NgComponent<Props> {
      static get $$ngIsClass() {
        return true
      }
      isDestroyed = false
      injectedProps: { [name: string]: any }
      constructor(private $element: IAugmentedJQuery, $scope: IRootScopeService, ...injectedProps: any[]) {
        super()
        this.injectedProps = { $scope}
        injectNames.forEach((name, i) => {
          this.injectedProps[name] = injectedProps[i]
        })
      }
      render() {
        if (!this.isDestroyed) {
          let props = this.props
          if (options && (options.evalAsync || options.applyAsync)) {
            props = wrapFunctionPropsToForceNgDigestCycle(this.injectedProps.$scope, this.props, options)
          }
          render(
            <Class {...props} {...this.injectedProps as any} />,
            this.$element[0]
          )
        }
      }
      componentWillUnmount() {
        this.isDestroyed = true
        unmountComponentAtNode(this.$element[0])
      }
    }]
  }
}

interface Options {
  evalAsync?: boolean
  applyAsync?: boolean
}

type Props = {
  [key: string]: any
}

function wrapFunctionPropsToForceNgDigestCycle ($scope: IRootScopeService, props: Props, options: Options) : object {
  return Object.keys(props)
    .reduce((wrappedProps : object, name: string) => {
      const prop = props[name]
      return {
        ...wrappedProps,
        [name] : isFunction(prop) ? (...args: any[]) => {
          prop(...args)
          if (options.evalAsync) {
            $scope.$evalAsync()
          } else if (options.applyAsync) {
            $scope.$applyAsync()
          }
        } : prop
      }
    }, {})
}
