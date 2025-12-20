// src/emails/contact-email.tsx
import React from 'react';
import { Html, Head, Body, Container, Text, Section, Row, Column, Img, Hr } from '@react-email/components';

interface ContactEmailProps {
  name: string;
  email: string;
  message: string;
}

export const ContactEmail = ({ name, email, message }: ContactEmailProps) => {
  return (
    <Html lang="pt-BR">
      <Head>
        <title>Nova Mensagem de Contato</title>
      </Head>
      <Body style={body}>
        <Container style={container}>
          <Section style={header}>
            <Row>
              <Column>
                <Text style={title}>Nova Mensagem de Contato</Text>
              </Column>
            </Row>
          </Section>
          
          <Section style={content}>
            <Row>
              <Column>
                <Text style={label}>Nome:</Text>
                <Text style={value}>{name}</Text>
              </Column>
            </Row>
            
            <Row>
              <Column>
                <Text style={label}>Email:</Text>
                <Text style={value}>{email}</Text>
              </Column>
            </Row>
            
            <Row>
              <Column>
                <Text style={label}>Mensagem:</Text>
                <Text style={messageStyle}>{message}</Text>
              </Column>
            </Row>
          </Section>
          
          <Hr style={divider} />
          
          <Section style={footer}>
            <Text style={footerText}>
              Esta mensagem foi enviada através do formulário de contato do site.
            </Text>
            <Text style={footerText}>
              Horário de envio: {new Date().toLocaleString('pt-BR')}
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

// Estilos para o email
const body = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  padding: '20px 0',
};

const container = {
  backgroundColor: '#ffffff',
  border: '1px solid #e0e7ff',
  borderRadius: '8px',
  maxWidth: '600px',
  margin: '0 auto',
  padding: '20px',
};

const header = {
  borderBottom: '1px solid #e0e7ff',
  paddingBottom: '15px',
  marginBottom: '20px',
};

const title = {
  color: '#333',
  fontSize: '22px',
  fontWeight: 'bold',
};

const content = {
  marginBottom: '30px',
};

const label = {
  color: '#666',
  fontSize: '14px',
  fontWeight: 'bold',
  marginBottom: '5px',
};

const value = {
  color: '#333',
  fontSize: '16px',
  marginBottom: '15px',
};

const messageStyle = {
  color: '#333',
  fontSize: '16px',
  backgroundColor: '#f8fafc',
  padding: '15px',
  borderRadius: '6px',
  border: '1px solid #e2e8f0',
  lineHeight: '1.6',
};

const divider = {
  border: 'none',
  borderTop: '1px solid #e0e7ff',
  margin: '20px 0',
};

const footer = {
  color: '#666',
  fontSize: '12px',
};

const footerText = {
  margin: '5px 0',
};