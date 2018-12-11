import React, { Component } from 'react';
import {List, ListItem} from '../../components/List';

class Home extends Component {
  state = {
    equation: "",
    solution: []
    }

    currEquation = ""
    
    solution = []

    solution2 = []

    currObj = {
      explanation: '',
      diagram: '',
      equation: ''
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
    this.currEquation = eq
    this.solution = []
    this.solution2 = []

    // eq = eq.replace(/\s/g,'')
    
    if (eq.search(/\d+\(/)>-1 || eq.search(/\)\(/)>-1) {
      eq = eq.replace(/\d+\(/g, x =>
        x.substring(0,x.length-1) + '<b> * (</b>'
        )
      eq = eq.replace(/\)\(/g,'<b>) * (</b>') 
      this.solution.push('Inserted implied multiplication symbols by parenthesis')
      this.solution.push(eq)
      this.currObj.explanation = 'Inserted implied multiplication symbols by parenthesis'
      this.currObj.equation = eq
      this.solution2.push(JSON.parse(JSON.stringify(this.currObj)));
      this.currObj.explanation = '' 
      eq = eq.replace(/<\/?[b|i]>/g,'')
      this.currEquation = eq
      // console.log(eq)
    }
    this.isValidInput(eq)
    if (!this.isValidInput(eq)) {
     this.setState({solution:[{
      equation:'<i>Error: invalid input</i>',
      diagram:'',
      explanation:''
    }]})
     return 0
    }

    while (eq.search(/\([^()]+\)/)>-1 ){
      // console.log(eq.match(/\([^()]+\)/))
      if (eq.search(/\([^()]+\)/)>-1) {
      this.solution.push('Entering a set of parenthesis (P)')
      this.solution.push('<b>P</b> --> E --> MD --> AS')
      this.currObj.explanation = 'Entering a set of parenthesis (P)'
      this.currObj.diagram = '<b>P</b> --> E --> MD --> AS'
      }
      let front = eq.search(/\([^()]+\)/)+1
      let end =  front
      while (eq[end] !== ')' && end<eq.length){
        end++
      }
      this.solution.push(eq.substring(0,front-1)+'<b>'+eq.substring(front-1,end+1)+'</b>'+eq.substring(end+1,eq.length))      
      this.currObj.equation = eq.substring(0,front-1)+'<b>'+eq.substring(front-1,end+1)+'</b>'+eq.substring(end+1,eq.length)
      this.solution2.push(JSON.parse(JSON.stringify(this.currObj)))
      this.currObj.explanation = ''
      this.currObj.diagram = ''
      this.currEquation = this.currEquation.replace(/<\/?b>/g,'')     
      let contents = this.solveRecurse(eq.substring(front,end),1)
      // console.log()
      // console.log(eq)
      // console.log(this.currEquation)
      // console.log()
      this.currEquation = this.currEquation.replace(/\([^()]+\)/, '<i>'+contents+'</i>')
      this.solution.push('Parenthesis set complete')
      this.solution.push(this.currEquation)
      this.currObj.explanation = 'Parenthesis set complete'
      this.currObj.equation = this.currEquation
      this.solution2.push(JSON.parse(JSON.stringify(this.currObj)))
      eq = this.currEquation.replace(/<\/?[b|i]>/g,'')
      // this.solution.push(eq)
      // console.log(this.state)
    }
    // console.log(eq)
    // console.log(this.currEquation)
    
    console.log(this.solveRecurse(eq,0))
    // console.log(this.solution)
    this.setState({
      solution:this.solution2,
      currEquation:this.currEquation
    })
    console.log(this.solution2)
  };

  isValidInput = (eq) => {
    // console.log(eq)

    if (eq.search(/\)\d/)>-1){
      return false
    }

    while (eq.search(/\([^()]+\)/)>-1 ){
      // console.log('yes')
      let front = eq.search(/\([^()]+\)/)+1
      let end = front
      while (eq[end] !== ')' && end<eq.length){
        end++
      }
      if (this.isValidInput(eq.substring(front,end))) {
        eq = eq.replace(/\([^()]+\)/, '4')
      } else {
        return false;
      }
    }
    // console.log(eq)
    return /^(?:\d+\s*[-\^\+\*\/]\s*)+\s*\d+\s*$/.test(eq)
  }

  solveRecurse = (eq, pLevel) => {
    // console.log(this.currEquation)
    // add and subtract
    if (eq.search(/[\+|-](?![^()]*\))/)>-1) {
      return this.operation(eq,pLevel,
        '+','-',
        (x,y) => x+y,(x,y) => x-y,
        /[\+|\-](?![^()]*\))/g,
        /(<i>)?-?\d+(<\/i>)?\s*[\+|\-]\s*(<i>)?\d+(<\/i>)?/,
        ['Starting addition and subtraction phase','E --> MD --> <b>AS</b>'])
    }

    // multiply and devide
    if (eq.search(/[\*|\/]/)>-1) {
      // console.log([eq,'wtf'])
      return this.operation(eq,pLevel,
        '*','/',
        (x,y) => x*y,(x,y) => x/y,
        /[\*|\/](?![^()]*\))/g,
        /(<i>)?\d+(<\/i>)?\s*[\*|\/]\s*(<i>)?\d+(<\/i>)?/,
        ['Starting multiplication and division phase','E --> <b>MD</b> --> AS'])
    }

    // exponents
    if (eq.search(/\^(?![^()]*\))/)>-1) {
      // console.log(eq)
      return this.operation(eq,pLevel,
        '^','^',
        (x,y) => Math.pow(x,y),
        (x,y) => Math.pow(x,y),
        /\^(?![^()]*\))/g,
        /(<i>)?\d+(<\/i>)?\s*\^\s*(<i>)?\d+(<\/i>)?/,
        ['Starting exponent phase','<b>E</b> --> MD --> AS'])
    }

    if (/^\s*$/.test(eq)) {
      return 0;
    }

    return parseInt(eq,10);
  };

  operation = (eq,pLevel,op1,op2,op1f,op2f,splitRegex,replaceRegex,statements) => {
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
    eq = eq.replace(/<\/?[b|i]>/g,'')
    let numbers = eq.split(splitRegex)
    // call recursive function leaving multiplication for later
    console.log(numbers)
    numbers = numbers.map(x => {    
      return this.solveRecurse(x,pLevel)
    })

    // console.log(pLevel)
    let pStrs = (pLevel===0)?(['','P --> ']):([' (within set of parenthesis)','<b>P</b> -- > '])
    // console.log(pStrs)
    this.solution.push(statements[0]+pStrs[0])
    this.solution.push(pStrs[1] + statements[1])
    this.currObj.explanation = statements[0]+pStrs[0]
    this.currObj.diagram = pStrs[1] + statements[1]

    let accumalator=numbers[0]
    // console.log(numbers)
    for (let i=1; i<numbers.length; i++){
      // console.log(numbers[i])
      if (pLevel === 0) {
        this.currEquation = this.currEquation.replace(replaceRegex,x => '<b>'+x+'</b>')
      } else {
        this.currEquation = this.currEquation.replace(/\([^()]+\)/,y => y.replace(replaceRegex,x => '<b>'+x+'</b>'))         
      }
      this.solution.push(this.currEquation)
      this.currObj.equation = this.currEquation
      this.solution2.push(JSON.parse(JSON.stringify(this.currObj)))
      this.currObj.explanation = ''
      this.currObj.diagram = ''
      this.currEquation = this.currEquation.replace(/<\/?[b|i]>/g,'')
      if (ops.shift()) {
        accumalator= op1f(accumalator,numbers[i])
      } else {
        accumalator= op2f(accumalator,numbers[i])
      }
      if (pLevel === 0) {
        this.currEquation = this.currEquation.replace(replaceRegex,'<i>'+accumalator+'</i>')
      } else {
        this.currEquation = this.currEquation.replace(/\([^()]+\)/,x => x.replace(replaceRegex,'<i>'+accumalator+'</i>'))         
      }
    }
    this.currObj.equation = this.currEquation
    this.solution2.push(JSON.parse(JSON.stringify(this.currObj)))
    this.solution.push(this.currEquation)
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
          {this.state.solution.map((o,i) => 
            (
              <ListItem key={i}>
                <p dangerouslySetInnerHTML={{__html: o.explanation}}></p>
                <p dangerouslySetInnerHTML={{__html: o.diagram}}></p>
                <p dangerouslySetInnerHTML={{__html: o.equation}}></p>
              </ListItem>
            )
            )}
        </List>
      </div>
      );
  }
}

export default Home;