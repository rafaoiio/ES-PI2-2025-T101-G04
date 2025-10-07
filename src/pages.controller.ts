// Autor: Rafael Gaudencio Dias
// Descrição: Controller das Páginas WEB
// Observação: requer instalação dos pacotes "express" e "@types/express" para uso do decorador @Res()
// Data: 07/10/2025 : 00:30

import { Controller, Get, Res } from "@nestjs/common";
import type { Response } from "express";
import { join } from 'path';

@Controller()  // Lugar onde vai ficar as **Rotas** de cada página WEB;
export class PagesController{ // crio uma classe PagesController, guardo as funções ( métodos), cada um é uma requisição;
    //O GET responde quando alguém faz alguma requisição, nesse em específico está vazio pois corresponde a "/", "localhost:3000";
    @Get()
    // O RES é a resposta que eu vou dar quando alguém fizer uma requisição, ele vem do Express
    home(@Res() res: Response){
        //Nessa linha envio um arquivo(sendFile) HTML, no caso o index.html
        //process.cwd - pega o diretório do meu projeto
        //join - ele junta os caminhos | '/public/html/index.html'
        //sendFile - o Express abre esse arquivo e envia o conteúdo
        return res.sendFile(join(process.cwd(), 'public', 'html', 'index.html'));
    }

    @Get('cadastro')
    cadastro(@Res() res: Response){
        return res.sendFile(join(process.cwd(), 'public', 'html', 'cadastro.html'));
    }

    @Get('esqueci')
    esqueci(@Res() res: Response){
        return res.sendFile(join(process.cwd(), 'public', 'html', 'esqueci.html'));
    }
}