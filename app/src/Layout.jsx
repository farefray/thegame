import { node } from 'prop-types';
import React from 'react';
import Helmet from 'react-helmet';
import Grid from 'hedron';

function Layout({ children }) {
  const { title, description } = {
    title: 'Imba auto chess',
    description: 'This is description'
  };

  return (
    <React.Fragment>
      <Helmet>
        <html lang="en" />
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:image" content="" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:creator" content="@colebemis" />
        <link rel="icon" type="image/png" href="favicon-32x32.png" sizes="32x32" />
        <link rel="icon" type="image/png" href="favicon-16x16.png" sizes="16x16" />
      </Helmet>
      <main>
        <Grid.Provider padding="20px" breakpoints={{ mobile: "-500", tablet: "501-750", desktop: "+750" }}>
          <Grid.Bounds direction="vertical" height="100vh">
            <Grid.Box>{children}</Grid.Box>
          </Grid.Bounds>
        </Grid.Provider>
      </main>
    </React.Fragment>
  );
}

Layout.propTypes = {
  children: node.isRequired
};

export default Layout;
