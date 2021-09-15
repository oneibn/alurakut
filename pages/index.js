import React from 'react'
import nookies from 'nookies';
import jwt from 'jsonwebtoken';
import MainGrid from '../src/components/MainGrid'
import Box from '../src/components/Box'
import { AlurakutMenu, AlurakutProfileSidebarMenuDefault, OrkutNostalgicIconSet } from '../src/lib/AlurakutCommons'
import { ProfileRelationsBoxWrapper } from '../src/components/ProfileRelations';

function ProfileSidebar(propriedades) {
	return (
		<Box as="aside">
	          <img src={`https://github.com/${propriedades.githubUser}.png`} style={{ borderRadius: '8px' }}/>
  	     	  <hr />

		  <p>
		    <a className="boxLink" href={`https://github.com/${propriedades.githubUser}`}>
		    </a>
		  </p>
		  <hr />

		  <AlurakutProfileSidebarMenuDefault />
		</Box>
	)
}

function ProfileRelationsBox(propriedades) {
	return (
		<ProfileRelationsBoxWrapper>
		  <h2 className="smallTitle">
			{propriedades.title} ({propriedades.items.length})
		  </h2>
		  <ul>
		  	{/* {seguidores.map((itemAtual) => {
				return (
		  			<li key={itemAtual}>
			   	          <a href={`https://github.com/${itemAtual}.png`}>
			                    <img src={itemAtual.image} />
			                    <span>{itemAtual.title}</span>
			                  </a>
			                </li>
			 	)
			})} */}
	          </ul>
	        </ProfileRelationsBoxWrapper>
	)
}

export default function Home(props) {
	const usuarioAleatorio = props.githubUser;
	const [comunidades, setComunidades] = React.useState([]);
	const pessoasFavoritas = [
		'akitaonrails',
		'omariosouto',
		'peas',
		'rafaballerini',
	]
	
	const [seguidores, setSeguidores] = React.useState([]);
	React.useEffect(function() {
// Pegar o array de dados do Github
		fetch('https://api.github.com/users/peas/followers')
		.then(function (respostaDoServidor) {
			return respostaDoServidor.json();
		})
		.then(function (respostaCompleta) {
			setSeguidores(respostaCompleta);
		})

// Api GraphQL
		fetch('https://graphql.datocms.com/', {
			method: 'POST',
			headers: {
				'Authorization': '53599831289923ae2532d5',
				'Content-Type': 'application/json',
				'Accept': 'application/json',
			},
			body: JSON.stringify({ "query": `query {
				allCommunities {
					id
					title
					imageUrl
					creatorSlug
					}
				}` })
		})
		.then((response) => response.json())
		.then((respostaCompleta) => {
			const comunidadesVindasDoDato = respostaCompleta.data.allCommunities;
			setComunidades(comunidadesVindasDoDato)
			})
	}, [])


	return (
	<>
	  <AlurakutMenu />
	  <MainGrid>
	    <div className="profileArea" style={{ gridArea: 'profileArea' }}>
	      <ProfileSidebar githubUser={usuarioAleatorio}/>
	    </div>
	    <div className="welcomeArea" style={{ gridArea: 'welcomeArea' }}>
	      <Box>
		<h1 className="title">
 	          Bem vindo(a)
		</h1>

		<OrkutNostalgicIconSet />
	      </Box>

	      <Box>
		<h2 className="subTitle">O que você deseja fazer?</h2>
		<form onSubmit={function handleCriaComunidade(e) {
			e.preventDefault();
			const dadosDoForm = new FormData(e.target);

			const comunidade = {
				title: dadosDoForm.get('title'),
				imageUrl: dadosDoForm.get('image'),
				creatorSlug: usuarioAleatorio,
			}

			fetch('/api/comunidades', {
				method: 'PÒST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stingify(comunidade)
			})
			.then(async (response) => {
				const dados = await response.json();
				
				const comunidade = dados.registroCriado;
				const comunidadesAtualizadas = [...comunidades, comunidade];
				setComunidades(comunidadesAtualizadas)
			})
		}}>
		  <div>
		    <input
			placeholder="Qual vai ser o nome da comunidade?"
			name='title'
			aria-label="Qual vai ser o nome da comunidade?"
			type="text"
		    />
		  </div>

		  <button>Criar comunidade</button>
		</form>
	      </Box>
	    </div>
	    <div className="profileRelationsArea" style={{ gridArea: 'profileRelationsArea' }}>
	      <ProfileRelationsBox title="Seguidores" items={seguidores} />
    	      <ProfileRelationsBoxWrapper>
		<h2 className="smallTitle">
		  Comunidades ({comunidades.length})
		</h2>
		<ul>
		  {comunidades.slice(0,6).map((itemAtual) => {
			  return (
				  <li key={itemAtual.id}>
				    <a href={`/communities/${itemAtual.id}`}>
				      <img src={itemAtual.imageUrl} />
				      <span>{itemAtual.title}</span>
				    </a>
				  </li>
			  )
		  })}
		</ul>
	      </ProfileRelationsBoxWrapper>
	      <ProfileRelationsBoxWrapper>
		<h2 className="smallTitle">
	          Pessoas da comunidade ({pessoasFavoritas.length})
	        </h2>

		<ul>
		  {pessoasFavoritas.slice(0,6).map((itemAtual) => {
			  return (
				  <li key={itemAtual}>
				    <a href={`/users/${itemAtual}`}>
				      <img src={`https://github.com/${itemAtual}.png`} />
				      <span>{itemAtual}</span>
				    </a>
				  </li>
			  )
		  })}
		</ul>
	      </ProfileRelationsBoxWrapper>
	    </div>
	  </MainGrid>
	</>
  )
}

export async function getServerSideProps(ctx) {
	const cookies = nookies.get(ctx);
	const token = cookies.USER_TOKEN;
	const decodedToken = jwt.decode(token);
	const githubUser = decodedToken?.githubUser;

	if (!githubUser) {
		return {
			redirect: {
				destination: '/login',
				permanent: false,
			},
		}
	}


	return {
		props: {
			githubUser,
		}
	}
}

