import React, { useState } from 'react';

const AuthPage = () => {
  const [form, setForm] = useState({
    email: '',
    password: ''
  });

  const requestBody = {
    query: `
      mutation {
        createUser(
          userInput: {
            email: "${form.email}",
            password: "${form.password}"
          }
        ) {
          _id
          email
        }
      }
    `
  };


  const loginBody = {
    query: `
      query {
        login(email: "${form.email}", password: "${form.password}") {
          userId
          token
          tokenExpiration
        }
      }
    `
  };

  const logout = () => {
    
  };

  const submitHandler = async e => {
    e.preventDefault();
    const isLogin = e.nativeEvent.submitter.id === 'login';

    const body = isLogin ? loginBody : requestBody;

    const result = await fetch('http://localhost:3000/graphql', {
      method: 'POST',
      body: JSON.stringify(body),
      headers: {
        'Content-Type': 'application/json'
      }
    }).catch(err => { return err.json()});

    console.log(result);
  }

  const updateField = e => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  return(
    <>
      <form onSubmit={submitHandler}>
        <p>
          <label htmlFor="email">
            E-mail
          </label>
          <input 
            type="email"
            id="email"
            name="email"
            value={form.email}
            onChange={updateField}
            required 
          />
        </p>

        <p>
          <label htmlFor="password">
            Password
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={form.password}
            onChange={updateField}
            required
          />
        </p>

        <button type="submit" id="createAccount">
          Create Account
        </button>
        <br />
        <button type="submit" id="login">
          Login
        </button>
      </form>
      <br />
      {
        <button onClick={logout}>
          Logout
        </button>
      }
    </>
  )
};

export default AuthPage;
