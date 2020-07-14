"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const angular_1 = require("angular");
const angular = require("angular");
require("angular-mocks");
const ngimport_1 = require("ngimport");
const PropTypes = require("prop-types");
const React = require("react");
const test_utils_1 = require("react-dom/test-utils");
const _1 = require("./");
class TestOne extends React.Component {
    render() {
        return React.createElement("div", null,
            React.createElement("p", null,
                "Foo: ",
                this.props.foo),
            React.createElement("p", null,
                "Bar: ",
                this.props.bar.join(',')),
            React.createElement("p", { onClick: () => this.props.baz(42) }, "Baz"),
            this.props.children);
    }
    componentWillUnmount() { }
}
const TestTwo = props => React.createElement("div", null,
    React.createElement("p", null,
        "Foo: ",
        props.foo),
    React.createElement("p", null,
        "Bar: ",
        props.bar.join(',')),
    React.createElement("p", { onClick: () => props.baz(42) }, "Baz"),
    props.children);
const TestThree = () => React.createElement("div", null, "Foo");
class TestFour extends React.Component {
    render() {
        return React.createElement("div", null, "Foo");
    }
}
class TestFive extends React.Component {
    render() {
        return React.createElement("div", null,
            React.createElement("p", null,
                "Foo: ",
                this.props.foo),
            React.createElement("p", null,
                "Bar: ",
                this.props.bar.join(',')),
            React.createElement("p", { onClick: () => this.props.baz(42) }, "Baz"),
            this.props.children);
    }
    componentWillUnmount() { }
}
TestFive.propTypes = {
    bar: PropTypes.array.isRequired,
    baz: PropTypes.func.isRequired,
    foo: PropTypes.number.isRequired
};
class TestSixService {
    constructor($q) {
        this.$q = $q;
    }
    foo() {
        return this.$q.resolve('testSixService result');
    }
}
class TestSix extends React.Component {
    constructor() {
        super(...arguments);
        this.state = {
            elementText: '',
            result: '',
            testSixService: ''
        };
    }
    render() {
        return React.createElement("div", null,
            React.createElement("p", null, this.state.result),
            React.createElement("p", null, this.state.elementText),
            React.createElement("p", null, this.state.testSixService),
            React.createElement("p", null, this.props.foo),
            React.createElement("span", null, "$element result"));
    }
    componentDidMount() {
        this.setState({
            elementText: this.props.$element.find('span').text()
        });
        this.props.$http.get('https://example.com/').then(_ => this.setState({ result: _.data }));
        this.props.testSixService.foo().then(_ => this.setState({ testSixService: _ }));
    }
}
function TestSeven(props) {
    return React.createElement("p", null, props.foo);
}
class TestEight extends React.Component {
    render() {
        this.props.onRender();
        return this.props.values
            .map((value, index) => React.createElement("div", { key: index }, value));
    }
    componentWillUnmount() {
        this.props.onComponentWillUnmount();
        this.props.onChange(this.props.values
            .map(val => `${val}ss`));
    }
}
class TestEightWrapper {
    constructor() {
        this.bindings = {
            onComponentWillUnmount: '<',
            onRender: '<',
            values: '<'
        };
        this.template = `<test-angular-eight
                on-change="$ctrl.onChange"
                on-component-will-unmount="$ctrl.onComponentWillUnmount"
                on-render="$ctrl.onRender"
                values="$ctrl.values">
              </test-angular-eight>`;
        this.controller = class {
            constructor($scope) {
                this.$scope = $scope;
                this.onChange = (values) => {
                    this.values = values;
                    this.$scope.$apply();
                };
            }
        };
    }
}
const TestAngularOne = _1.react2angular(TestOne, ['foo', 'bar', 'baz']);
const TestAngularTwo = _1.react2angular(TestTwo, ['foo', 'bar', 'baz']);
const TestAngularThree = _1.react2angular(TestThree);
const TestAngularFour = _1.react2angular(TestFour);
const TestAngularSix = _1.react2angular(TestSix, ['foo'], ['$http', '$element', 'testSixService', 'foo']);
const TestAngularSeven = _1.react2angular(TestSeven, null, ['foo']);
const TestAngularEight = _1.react2angular(TestEight, ['values', 'onComponentWillUnmount', 'onRender', 'onChange']);
angular_1.module('test', ['bcherny/ngimport'])
    .component('testAngularOne', TestAngularOne)
    .component('testAngularTwo', TestAngularTwo)
    .component('testAngularThree', TestAngularThree)
    .component('testAngularFour', TestAngularFour)
    .service('testSixService', ['$q', TestSixService])
    .constant('foo', 'CONSTANT FOO')
    .component('testAngularSix', TestAngularSix)
    .component('testAngularSeven', TestAngularSeven)
    .component('testAngularEight', TestAngularEight)
    .component('testAngularEightWrapper', new TestEightWrapper());
angular_1.bootstrap(angular_1.element(), ['test'], { strictDi: true });
describe('react2angular', () => {
    let $compile;
    beforeEach(() => {
        angular.mock.module('test');
        angular.mock.inject(function (_$compile_) {
            $compile = _$compile_;
        });
    });
    describe('initialization', () => {
        it('should give an angular component', () => {
            expect(TestAngularOne.bindings).not.toBe(undefined);
            expect(TestAngularOne.controller).not.toBe(undefined);
        });
        it('should use the propTypes when present and no bindingNames were specified', () => {
            const reactAngularComponent = _1.react2angular(TestFive);
            expect(reactAngularComponent.bindings).toEqual({
                bar: '<',
                baz: '<',
                foo: '<'
            });
        });
        it('should use the bindingNames when present over the propTypes', () => {
            const reactAngularComponent = _1.react2angular(TestFive, ['foo']);
            expect(reactAngularComponent.bindings).toEqual({
                foo: '<'
            });
        });
        it('should have empty bindings when parameter is an empty array', () => {
            const reactAngularComponent = _1.react2angular(TestFive, []);
            expect(reactAngularComponent.bindings).toEqual({});
        });
        it('should have empty bindings when parameter is not passed', () => {
            expect(_1.react2angular(TestThree).bindings).toEqual({});
        });
        it('should use the injectNames for DI', () => {
            const defaultDi = _1.react2angular(TestThree).controller.slice(0, -1);
            const injectedDi = _1.react2angular(TestThree, null, ['foo', 'bar']).controller.slice(0, -1);
            expect(injectedDi).toEqual(defaultDi.concat(['foo', 'bar']));
        });
        it('should have default DI specifications if injectNames is empty', () => {
            const defaultDi = _1.react2angular(TestThree).controller.slice(0, -1);
            const injectedDi = _1.react2angular(TestThree, null, []).controller.slice(0, -1);
            expect(injectedDi).toEqual(defaultDi);
        });
    });
    describe('react classes', () => {
        it('should render', () => {
            const scope = Object.assign(ngimport_1.$rootScope.$new(true), {
                bar: [true, false],
                baz: (value) => value + 1,
                foo: 1
            });
            const element = angular_1.element(`<test-angular-one foo="foo" bar="bar" baz="baz"></test-angular-one>`);
            $compile(element)(scope);
            ngimport_1.$rootScope.$apply();
            expect(element.find('p').length).toBe(3);
        });
        it('should render (even if the component takes no props)', () => {
            const scope = ngimport_1.$rootScope.$new(true);
            const element = angular_1.element(`<test-angular-four></test-angular-four>`);
            $compile(element)(scope);
            ngimport_1.$rootScope.$apply();
            expect(element.text()).toBe('Foo');
        });
        it('should update', () => {
            const scope = Object.assign(ngimport_1.$rootScope.$new(true), {
                bar: [true, false],
                baz: (value) => value + 1,
                foo: 1
            });
            const element = angular_1.element(`<test-angular-one foo="foo" bar="bar" baz="baz"></test-angular-one>`);
            $compile(element)(scope);
            ngimport_1.$rootScope.$apply();
            expect(element.find('p').eq(1).text()).toBe('Bar: true,false');
            scope.$apply(() => scope.bar = [false, true, true]);
            expect(element.find('p').eq(1).text()).toBe('Bar: false,true,true');
        });
        it('should destroy', () => {
            const scope = Object.assign(ngimport_1.$rootScope.$new(true), {
                bar: [true, false],
                baz: (value) => value + 1,
                foo: 1
            });
            const element = angular_1.element(`<test-angular-one foo="foo" bar="bar" baz="baz"></test-angular-one>`);
            $compile(element)(scope);
            ngimport_1.$rootScope.$apply();
            spyOn(TestOne.prototype, 'componentWillUnmount');
            scope.$destroy();
            expect(TestOne.prototype.componentWillUnmount).toHaveBeenCalled();
        });
        it('should take callbacks', () => {
            const baz = jasmine.createSpy('baz');
            const scope = Object.assign(ngimport_1.$rootScope.$new(true), {
                bar: [true, false],
                baz,
                foo: 1
            });
            const element = angular_1.element(`<test-angular-one foo="foo" bar="bar" baz="baz"></test-angular-one>`);
            $compile(element)(scope);
            ngimport_1.$rootScope.$apply();
            test_utils_1.Simulate.click(element.find('p').eq(2)[0]);
            expect(baz).toHaveBeenCalledWith(42);
        });
        // TODO: support children
        it('should not support children', () => {
            const scope = Object.assign(ngimport_1.$rootScope.$new(true), {
                bar: [true, false],
                baz: (value) => value + 1,
                foo: 1
            });
            const element = angular_1.element(`<test-angular-one foo="foo" bar="bar" baz="baz"><span>Transcluded</span></test-angular-one>`);
            $compile(element)(scope);
            ngimport_1.$rootScope.$apply();
            expect(element.find('span').length).toBe(0);
        });
        // it('should take injections, which override props', () => {
        //   spyOn($http, 'get').and.returnValue($q.resolve({ data: '$http response' }))
        //   const scope = Object.assign($rootScope.$new(true), {
        //     foo: 'FOO'
        //   })
        //   const element1 = $(`<test-angular-six foo="foo"></test-angular-six>`)
        //   $compile(element1)(scope)
        //   const element2 = $(`<test-angular-seven foo="foo"></test-angular-seven>`)
        //   $compile(element2)(scope)
        //   $rootScope.$apply()
        //   expect($http.get).toHaveBeenCalledWith('https://example.com/')
        //   expect(element1.find('p').eq(0).text()).toBe('$http response', '$http is injected')
        //   expect(element1.find('p').eq(1).text()).toBe('$element result', '$element is injected')
        //   expect(element1.find('p').eq(2).text()).toBe('testSixService result', 'testSixService is injected')
        //   expect(element1.find('p').eq(3).text()).toBe('CONSTANT FOO', 'injections should override props')
        //   expect(element2.find('p').text()).toBe('CONSTANT FOO', 'injections should override props')
        // })
    });
    describe('react stateless components', () => {
        it('should render', () => {
            const scope = Object.assign(ngimport_1.$rootScope.$new(true), {
                bar: [true, false],
                baz: (value) => value + 1,
                foo: 1
            });
            const element = angular_1.element(`<test-angular-two foo="foo" bar="bar" baz="baz"></test-angular-two>`);
            $compile(element)(scope);
            ngimport_1.$rootScope.$apply();
            expect(element.find('p').length).toBe(3);
        });
        it('should render (even if the component takes no props)', () => {
            const scope = ngimport_1.$rootScope.$new(true);
            const element = angular_1.element(`<test-angular-three></test-angular-three>`);
            $compile(element)(scope);
            ngimport_1.$rootScope.$apply();
            expect(element.text()).toBe('Foo');
        });
        it('should update', () => {
            const scope = Object.assign(ngimport_1.$rootScope.$new(true), {
                bar: [true, false],
                baz: (value) => value + 1,
                foo: 1
            });
            const element = angular_1.element(`<test-angular-two foo="foo" bar="bar" baz="baz"></test-angular-two>`);
            $compile(element)(scope);
            ngimport_1.$rootScope.$apply();
            expect(element.find('p').eq(1).text()).toBe('Bar: true,false');
            scope.$apply(() => scope.bar = [false, true, true]);
            expect(element.find('p').eq(1).text()).toBe('Bar: false,true,true');
        });
        // TODO: figure out how to test this
        xit('should destroy', () => { });
        it('should take callbacks', () => {
            const baz = jasmine.createSpy('baz');
            const scope = Object.assign(ngimport_1.$rootScope.$new(true), {
                bar: [true, false],
                baz,
                foo: 1
            });
            const element = angular_1.element(`<test-angular-two foo="foo" bar="bar" baz="baz"></test-angular-two>`);
            $compile(element)(scope);
            ngimport_1.$rootScope.$apply();
            test_utils_1.Simulate.click(element.find('p').eq(2)[0]);
            expect(baz).toHaveBeenCalledWith(42);
        });
        // TODO: support children
        it('should not support children', () => {
            const scope = Object.assign(ngimport_1.$rootScope.$new(true), {
                bar: [true, false],
                baz: (value) => value + 1,
                foo: 1
            });
            const element = angular_1.element(`<test-angular-two foo="foo" bar="bar" baz="baz"><span>Transcluded</span></test-angular-two>`);
            $compile(element)(scope);
            ngimport_1.$rootScope.$apply();
            expect(element.find('span').length).toBe(0);
        });
        it('should not call render after component unmount', () => {
            const componentWillUnmountSpy = jasmine.createSpy('componentWillUnmount');
            const renderSpy = jasmine.createSpy('render');
            const scope = Object.assign(ngimport_1.$rootScope.$new(true), {
                onComponentWillUnmount: componentWillUnmountSpy,
                onRender: renderSpy,
                values: ['val1']
            });
            const element = angular_1.element(`
        <test-angular-eight-wrapper
          on-render="onRender"
          on-component-will-unmount="onComponentWillUnmount"
          values="values">
        </test-angular-eight-wrapper>
      `);
            $compile(element)(scope);
            const childScope = angular
                .element(element.find('test-angular-eight'))
                .scope();
            ngimport_1.$rootScope.$apply();
            // Erase first render caused on apply
            renderSpy.calls.reset();
            // Destroy child component to cause unmount
            childScope.$destroy();
            // Make sure render on child was not called after unmount
            expect(componentWillUnmountSpy.calls.count()).toEqual(1);
            expect(renderSpy.calls.count()).toEqual(0);
            expect(componentWillUnmountSpy).not.toHaveBeenCalledBefore(renderSpy);
        });
    });
});
//# sourceMappingURL=test.js.map