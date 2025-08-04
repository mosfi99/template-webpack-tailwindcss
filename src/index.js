import './styles.css';
import { greeting } from './greeting.js';
import sonicImg from './img/sonic.png';

const image = document.createElement('img');

image.src = sonicImg;
document.body.appendChild(image);
console.log(greeting);
