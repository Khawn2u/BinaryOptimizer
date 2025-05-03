# Binary optimizer

Uses the polynomial form of binary (or probability) operations, like OR being a+b-(a\*b) or And being a\*b, to make binary logic optimizable. Then the gates's inputs can be optimized to find solutions that satisfy an output.
Does not work as well as I hoped. If it did I'd be taking over the world bu using this to solve NP complete problems I guess.

I tried using this for factoring large numbers, did not work to well. I assume this does not work because it gets stuck in local minima, I think it may be possable to use higer oerder derivitives to avoid local minima.
