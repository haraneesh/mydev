import { createGlobalStyle } from 'styled-components';

const GlobalStyle = createGlobalStyle`
  :root {

    --facebook: #3b5998;
    --google: #ea4335;
    --github: var(--gray-dark);

    --gray-base:              #493934; // #151515 ;
    --gray-darker:            #453631; 
    --gray-dark:              #3e302c; 
    --gray:                   #97776d 
    --gray-light:             #a78c83;
    --gray-lighter:           #b7a19a;
    --gray-lightText:         #fff ;
    
    --brand-primary:         #e47277; 
    --brand-default:         #522E23; 
    --brand-success:         #95B5AC; 
    --brand-info:            #976A4B; 
    --brand-warning:         #FD6C00; 
    --brand-danger:          #EF0905;
    --brand-logo-yellow:     #FFB800;

    --stick-zIndex: 1000;
  }

  body{
   background:#F5F1EF;
  }

  .btn-primary {
    background-color: var(--brand-primary);
    border: none;
  }

  a:hover, a:focus, .btn-link:hover, .btn-link:focus {
    color: var(--gray-base)
  }

  .btn-primary:hover, 
  .btn-primary:focus,.btn-primary:active:hover, 
  .btn-primary:active:focus, .btn-primary:active.focus, 
  .btn-primary.active:hover, .btn-primary.active:focus, 
  .btn-primary.active.focus, .open > .btn-primary.dropdown-toggle:hover, 
  .open > .btn-primary.dropdown-toggle:focus, 
  .open > .btn-primary.dropdown-toggle.focus {
    background-color: #e47277;
  }

  .btn-success, .btn-success:active:hover, 
  .btn-success:active:focus, .btn-success:active.focus, 
  .btn-success.active:hover, .btn-success.active:focus, 
  .btn-success.active.focus, .open > .btn-success.dropdown-toggle:hover, 
  .open > .btn-success.dropdown-toggle:focus, 
  .open > .btn-success.dropdown-toggle.focus,
  {
    background-color: var(--brand-success);
    border: none;
  }

  .btn-info, .btn-info:active:hover, 
  .btn-info:active:focus, .btn-info:active.focus, 
  .btn-info.active:hover, .btn-info.active:focus, 
  .btn-info.active.focus, .open > .btn-info.dropdown-toggle:hover, 
  .open > .btn-info.dropdown-toggle:focus, 
  .open > .btn-info.dropdown-toggle.focus {
    background-color: var(--brand-info);
    border: none;
  }

  /* Removes unnecessary bottom padding on .container */
  body > #react-root > div > .container {
    padding-bottom: 0;
  }

  `;

export default GlobalStyle;
