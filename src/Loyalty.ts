import { Field, SmartContract, state, State, method, Account, Poseidon, MerkleTree, MerkleWitness} from 'snarkyjs';

export class Loyalty extends SmartContract {
    // the root is the root hash of our off-chain Merkle tree
    @state(Field) root = State<Field>();
  
    init(token: Field[]) {
      super.init();
      const treeHeight = token.length;
      const Tree = new MerkleTree(treeHeight);
      Tree.fill(token);
      const root = Tree.getRoot();
      this.root.set(root);
    }
  
    @method claimReward(account: Account, token: Field, path: MerkleWitness) {
      // we fetch the on-chain commitment
      const root = this.root.get();
      this.root.assertEquals(root);
  
      // we check that the account is within the committed Merkle Tree
      path.calculateRoot(Poseidon.hash([token])).assertEquals(root);
  
      // finally, we send the player a reward
      this.send({
        to: account.address,
        amount: 100_000_000,
      });
    }
  }
