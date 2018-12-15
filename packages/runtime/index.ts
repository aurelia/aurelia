import 'reflect-metadata';
// import { init, Element, HTMLElement } from './basichtml';
import { DOM, Aurelia, ValueConverterResource } from './runtime';
import { observable } from './observable';

// const doc = init().document;
// DOM.setHtmlReference(doc as any, Element as any, HTMLElement as any, class SVGElement_ {} as any);

import { BasicConfiguration } from './jit';

import { customElement } from './runtime';

@customElement({
  name: 'app',
  template: /*html*/ `
	<template>
		<div>Hello world</div>
		<select value.two-way='meshcolor'>
			<option>lightblue</option>
			<option>lightpink</option>
			<option>yellow</option>
		</select>
		<div>
			X rotation: \${xStep}
			<input type='range' value.two-way='xStep | number' step='0.01' min=0.01 max=0.1 >
			Y rotation: \${yStep}
			<input type='range' value.two-way='yStep | number' step='0.01' min=0.01 max=0.1 >
		</div>
		<hr>
		<t-webgl ref='renderer' width='400' height='400'>
			<t-scene background='white' ref='scene'>
				<t-mesh rotation="\${x} \${y} 0" ref='cube'>
					<t-geo-box width="1" height="1" depth="1"></t-geo-box>
					<t-material color.bind="meshcolor"></t-material>
				</t-mesh>
			</t-scene>
			<t-camera far="5" position="0 0 3" ref='camera'></t-camera>
		</t-webgl>
  </template>`
})
export class App {
	x = 0;
	y = 0;
	xStep = 0.01;
	yStep = 0.01;
	meshcolor = 'lightpink'

	renderer: THREE.Renderer;
	scene: THREE.Scene;
	camera: THREE.PerspectiveCamera;

	attached() {
		requestAnimationFrame(this.animate);
	}

	animate = () => {
		this.x += this.xStep;
		this.y += this.yStep;
		requestAnimationFrame(this.animate);
		this.renderer.render(this.scene, this.camera);
	}
}

window['au'] = new Aurelia()
	.register(
		BasicConfiguration,
		ValueConverterResource.define('number', class {
			fromView(val: string) {
				return Number(val);
			}
		})
	)
	.app({
		component: App,
		host: document.body
	})
	.start();
