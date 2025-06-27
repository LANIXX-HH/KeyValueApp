import React from 'react';
import '@cloudscape-design/global-styles/index.css';
import { AppLayout, ContentLayout, Container, Header } from '@cloudscape-design/components';

function App() {
  return (
    <AppLayout
      content={
        <ContentLayout>
          <Container>
            <Header variant="h1">
              Key-Value Store Test
            </Header>
            <p>Cloudscape Design System funktioniert!</p>
          </Container>
        </ContentLayout>
      }
      navigationHide
      toolsHide
    />
  );
}

export default App;
