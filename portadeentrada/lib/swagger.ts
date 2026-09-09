export const swaggerConfig = {
  openapi: '3.0.0',
  info: {
    title: 'Porta de Entrada API',
    description: 'API do portal cultural da Prefeitura de São Paulo',
    version: '1.0.0',
    contact: {
      name: 'Secretaria Municipal de Cultura',
      email: 'cultura@prefeitura.sp.gov.br',
    },
  },
  servers: [
    {
      url: 'http://localhost:3000',
      description: 'Servidor de desenvolvimento',
    },
  ],
  paths: {
    '/api/cultura': {
      get: {
        summary: 'Listar programas culturais',
        description: 'Retorna todos os programas culturais disponíveis',
        tags: ['Cultura'],
        responses: {
          '200': {
            description: 'Sucesso',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: {
                    $ref: '#/components/schemas/ProgramaCultural',
                  },
                },
              },
            },
          },
        },
      },
      post: {
        summary: 'Criar programa cultural',
        description: 'Cria um novo programa cultural (requer autenticação EDITOR ou ADMIN)',
        tags: ['Cultura'],
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ProgramaCulturalInput',
              },
            },
          },
        },
        responses: {
          '201': {
            description: 'Programa criado com sucesso',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ProgramaCultural',
                },
              },
            },
          },
          '401': {
            description: 'Não autorizado',
          },
          '403': {
            description: 'Acesso negado',
          },
        },
      },
    },
    '/api/cultura/{id}': {
      get: {
        summary: 'Buscar programa cultural por ID',
        description: 'Retorna um programa cultural específico',
        tags: ['Cultura'],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: {
              type: 'string',
            },
            description: 'ID do programa cultural (CUID)',
          },
        ],
        responses: {
          '200': {
            description: 'Sucesso',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ProgramaCultural',
                },
              },
            },
          },
          '404': {
            description: 'Programa não encontrado',
          },
        },
      },
      put: {
        summary: 'Atualizar programa cultural',
        description: 'Atualiza um programa cultural existente (requer autenticação EDITOR ou ADMIN)',
        tags: ['Cultura'],
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: {
              type: 'string',
            },
            description: 'ID do programa cultural (CUID)',
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ProgramaCulturalUpdate',
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Programa atualizado com sucesso',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ProgramaCultural',
                },
              },
            },
          },
          '400': {
            description: 'Nenhum campo válido para atualização',
          },
          '401': {
            description: 'Não autorizado',
          },
          '403': {
            description: 'Acesso negado',
          },
          '404': {
            description: 'Programa não encontrado',
          },
        },
      },
      delete: {
        summary: 'Remover programa cultural',
        description: 'Remove um programa cultural (requer autenticação ADMIN)',
        tags: ['Cultura'],
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: {
              type: 'string',
            },
            description: 'ID do programa cultural (CUID)',
          },
        ],
        responses: {
          '200': {
            description: 'Programa removido com sucesso',
          },
          '401': {
            description: 'Não autorizado',
          },
          '403': {
            description: 'Apenas administradores podem remover',
          },
          '404': {
            description: 'Programa não encontrado',
          },
        },
      },
    },
    '/api/auth/register': {
      post: {
        summary: 'Registrar novo usuário',
        description: 'Cria uma nova conta de usuário (rate limit: 5 registros por IP por hora)',
        tags: ['Autenticação'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/RegisterInput',
              },
            },
          },
        },
        responses: {
          '201': {
            description: 'Usuário criado com sucesso',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/User',
                },
              },
            },
          },
          '400': {
            description: 'Dados obrigatórios faltando ou senha muito curta',
          },
          '409': {
            description: 'Email já está em uso',
          },
          '429': {
            description: 'Limite de registros atingido',
          },
        },
      },
    },
    '/api/inscricoes': {
      get: {
        summary: 'Listar inscrições',
        description: 'Retorna as inscrições do usuário logado (ou todas para ADMIN)',
        tags: ['Inscrições'],
        security: [{ BearerAuth: [] }],
        responses: {
          '200': {
            description: 'Sucesso',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: {
                    $ref: '#/components/schemas/Inscricao',
                  },
                },
              },
            },
          },
          '401': {
            description: 'Não autorizado',
          },
        },
      },
      post: {
        summary: 'Criar inscrição',
        description: 'Inscreve o usuário em um programa cultural',
        tags: ['Inscrições'],
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/InscricaoInput',
              },
            },
          },
        },
        responses: {
          '201': {
            description: 'Inscrição criada com sucesso',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Inscricao',
                },
              },
            },
          },
          '400': {
            description: 'Dados obrigatórios faltando',
          },
          '401': {
            description: 'Não autorizado',
          },
        },
      },
    },
  },
  components: {
    securitySchemes: {
      BearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Token JWT obtido via login',
      },
    },
    schemas: {
      ProgramaCultural: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            example: 'cm0x2y3z4...',
          },
          titulo: {
            type: 'string',
            example: 'PROMAC',
          },
          descricao: {
            type: 'string',
            example: 'Programa Municipal de Apoio a Projetos Culturais',
          },
          categoria: {
            type: 'string',
            example: 'Fomento',
          },
          status: {
            type: 'string',
            enum: ['aberto', 'em_andamento', 'encerrado'],
            example: 'aberto',
          },
          dataInicio: {
            type: 'string',
            format: 'date',
            example: '2026-01-15',
          },
          dataFim: {
            type: 'string',
            format: 'date',
            example: '2026-03-30',
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
          },
        },
        required: ['titulo', 'descricao', 'categoria', 'status'],
      },
      ProgramaCulturalInput: {
        type: 'object',
        properties: {
          titulo: {
            type: 'string',
          },
          descricao: {
            type: 'string',
          },
          categoria: {
            type: 'string',
          },
          status: {
            type: 'string',
            enum: ['aberto', 'em_andamento', 'encerrado'],
          },
          dataInicio: {
            type: 'string',
            format: 'date',
          },
          dataFim: {
            type: 'string',
            format: 'date',
          },
        },
        required: ['titulo', 'descricao', 'categoria', 'status'],
      },
      ProgramaCulturalUpdate: {
        type: 'object',
        properties: {
          titulo: {
            type: 'string',
          },
          descricao: {
            type: 'string',
          },
          categoria: {
            type: 'string',
          },
          status: {
            type: 'string',
            enum: ['aberto', 'em_andamento', 'encerrado'],
          },
          dataInicio: {
            type: 'string',
            format: 'date',
          },
          dataFim: {
            type: 'string',
            format: 'date',
          },
        },
        description: 'Todos os campos são opcionais. Apenas campos fornecidos serão atualizados.',
      },
      RegisterInput: {
        type: 'object',
        properties: {
          name: {
            type: 'string',
          },
          email: {
            type: 'string',
            format: 'email',
          },
          password: {
            type: 'string',
            minLength: 6,
          },
        },
        required: ['name', 'email', 'password'],
      },
      User: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
          },
          name: {
            type: 'string',
          },
          email: {
            type: 'string',
          },
          role: {
            type: 'string',
            enum: ['ADMIN', 'EDITOR', 'VIEWER'],
          },
        },
      },
      Inscricao: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
          },
          programaId: {
            type: 'string',
          },
          nomeCompleto: {
            type: 'string',
          },
          email: {
            type: 'string',
          },
          telefone: {
            type: 'string',
          },
          cpf: {
            type: 'string',
          },
          rg: {
            type: 'string',
          },
          endereco: {
            type: 'string',
          },
          cidade: {
            type: 'string',
          },
          estado: {
            type: 'string',
          },
          cep: {
            type: 'string',
          },
          portfolioUrl: {
            type: 'string',
          },
          cartaIntencao: {
            type: 'string',
          },
          status: {
            type: 'string',
            enum: ['pendente', 'aprovada', 'rejeitada'],
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
          },
        },
      },
      InscricaoInput: {
        type: 'object',
        properties: {
          programaId: {
            type: 'string',
          },
          nomeCompleto: {
            type: 'string',
          },
          email: {
            type: 'string',
          },
          telefone: {
            type: 'string',
          },
          cpf: {
            type: 'string',
          },
          rg: {
            type: 'string',
          },
          endereco: {
            type: 'string',
          },
          cidade: {
            type: 'string',
          },
          estado: {
            type: 'string',
          },
          cep: {
            type: 'string',
          },
          portfolioUrl: {
            type: 'string',
          },
          cartaIntencao: {
            type: 'string',
          },
        },
        required: ['programaId', 'nomeCompleto', 'email', 'cpf'],
      },
    },
  },
}
