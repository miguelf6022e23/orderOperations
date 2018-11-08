import React, { Component } from 'react';
import {List, ListItem} from '../../components/List';

class Home extends Component {
  state = {
    equation: "",
    solution: [],
    currEquation: ""
    }

  inputChange = event => {
    if (typeof event.preventDefault === 'function') {
      event.preventDefault();
    }

    this.setState({
      [event.target.id]: event.target.value
    });
    // console.log(this.state);
  };

  solveStart = () => {
    let eq = this.state.equation
    this.state.currEquation = eq
    this.state.solution = []

    eq = eq.replace(/\s/g,'')
    
    if (eq.search(/\d+\(/)>-1 || eq.search(/\)\(/)>-1) {
      eq = eq.replace(/\d+\(/g, x =>
        x.substring(0,x.length-1) + ' * ('
        )
      eq = eq.replace(/\)\(/g,') * (') 
      console.log('Inserted implied multiplication')
      console.log(eq)
    }

    while (eq.search(/\([^)]+\)/)>-1 ){
      let front = eq.search(/\([^(]+\)/)+1
      let end =  front
      while (eq[end] !== ')' && end<eq.length){
        end++
      }
      let contents = this.solveRecurse(eq.substring(front,end),1)
      eq = eq.replace(/\([^(]+\)/, '<i>'+contents+'</i>')
      this.state.currEquation = eq
      // this.state.solution.push(eq)
      console.log(this.state)
    }

    // regex checking for invalid input <-------------------------------------------------------------------------
    

    console.log(this.solveRecurse(eq))
    console.log(this.state.solution)
    this.state.solution.push(this.state.currEquation)
    this.setState(
      this.state
      )
  };

  solveRecurse = (eq, pLevel = 0) => {

    // add and subtract
    if (eq.search(/[\+|-](?![^()]*\))/)>-1) {
      return this.operation(eq,pLevel,'+','-',(x,y) => x+y,(x,y) => x-y,/[\+|\-](?![^()]*\))/g,/(<i>)?-?\d+(<\/i>)?\s*[\+|\-]+\s*(<i>)?\d+(<\/i>)?/)
    }

    // multiply and devide
    if (eq.search(/[\*|\/](?![^()]*\))/)>-1) {
      return this.operation(eq,pLevel,'*','/',(x,y) => x*y,(x,y) => x/y,/[\*|\/](?![^()]*\))/g,/(<i>)?\d+(<\/i>)?\s*[\*|\/]\s*(<i>)?\d+(<\/i>)?/)
    }

    // exponents
    if (eq.search(/\^(?![^()]*\))/)>-1) {
      return this.operation(eq,pLevel,'^','^',(x,y) => Math.pow(x,y),(x,y) => Math.pow(x,y),/\^(?![^()]*\))/g,/(<i>)?\d+(<\/i>)?\s*\^\s*(<i>)?\d+(<\/i>)?/)
    }

    return eq
  };

  operation = (eq,pLevel,op1,op2,op1f,op2f,splitRegex,replaceRegex) => {
    let ops = []
    let parens = []
    for (let i=0; i<eq.length; i++) {
      if (eq[i] === op1 && parens.length === 0) {
        ops.push(true)
      } else if (eq[i] === op2 && parens.length === 0) {
        ops.push(false)
      } else if (eq[i] === '(') {
        parens.push(i)
      } else if (eq[i] === ')') {
        parens.pop()
      }
    }
    let numbers = eq.split(splitRegex)
    // call recursive function leaving multiplication for later
    // console.log(numbers)
    numbers = numbers.map(x => {
      x = x.replace('<b>','')
      x = x.replace('</b>','')
      x = x.replace('<i>','')
      x = x.replace('</i>','')      
      return this.solveRecurse(x)
    })

    let accumalator=parseInt(numbers[0])
    // console.log(numbers)
    for (let i=1; i<numbers.length; i++){
      // console.log(parseInt(numbers[i]))
      
      this.state.currEquation = this.state.currEquation.replace(replaceRegex,x => '<b>'+x+'</b>')
      this.state.solution.push(this.state.currEquation)
      this.state.currEquation = this.state.currEquation.replace('<b>','')
      this.state.currEquation = this.state.currEquation.replace('</b>','')
      this.state.currEquation = this.state.currEquation.replace('<i>','')
      this.state.currEquation = this.state.currEquation.replace('</i>','')      
      if (ops.shift()) {
        accumalator= op1f(accumalator,parseInt(numbers[i]))
      } else {
        accumalator= op2f(accumalator,parseInt(numbers[i]))
      }
      if (pLevel === 0) {
        this.state.currEquation = this.state.currEquation.replace(replaceRegex,'<i>'+accumalator+'</i>')
      } else {
        this.state.currEquation = this.state.currEquation.replace(/\([^(]+\)/,x => x.replace(replaceRegex,'<i>'+accumalator+'</i>'))         
      }
      // ital < ------------------------------------------------------------------
    }
    return accumalator
  };

  render() {
    return (
      <div>
        <div>
          <input id="equation" onChange={this.inputChange} />     
          <button onClick={this.solveStart} >Solve!</button>
        </div>
        <List>
          {this.state.solution.map(s => 
            (
              <ListItem>
                <p dangerouslySetInnerHTML={{__html: s}}></p>
              </ListItem>
            )
            )}
        </List>
      </div>
      );
  }
}

export default Home;