from ortools.linear_solver import pywraplp
import json
import sys
import func_timeout


###
# input: dhat: approximative durations
# arrayOfDurations: array of possible durations
# signature: total time of a measure

# returns "0" if no solution, or the array that gives the duration for each note
###
def solve(dhat, arrayOfDurations, signature):
    solver = pywraplp.Solver.CreateSolver("SAT") #Mixed-integer linear programming
    
    if not solver:
        return

    inf = solver.infinity()
    
    n = len(dhat)
    booleanVars = []

    for i in range(n):
        booleanVars.append([])
        for duration in arrayOfDurations[i]:
            booleanVars[i].append(solver.IntVar(0, 1, "d" + str(i) + "_" + str(duration)))

    print("Number of variables =", solver.NumVariables())


    for i in range(n):
        ct = solver.Constraint(1, 1, "di")
        for j in range(len(arrayOfDurations[i])):
            ct.SetCoefficient(booleanVars[i][j], 1)

## add the "virtual" variable di (duration of the i-th note) multiplied by coeff to the constraint ct
    def addDi(ct, i, coeff):
        for j in range(len(arrayOfDurations[i])):
            ct.SetCoefficient(booleanVars[i][j], coeff*arrayOfDurations[i][j])

    ct = solver.Constraint(signature, signature, "total duration")
    for i in range(n):
        addDi(ct, i, 1)

    

    print("Number of constraints =", solver.NumConstraints())


    objective = solver.Objective()
    objective.SetMinimization()

    for i in range(n):
        for j in range(n):
                if dhat[i] >= dhat[j]:
                    errorVar = solver.NumVar(0, inf, "error when di is smaller than dj")
                    ct = solver.Constraint(0.0000001, inf, "di is generally greater than dj")
                    ct.SetCoefficient(errorVar, 1)
                    addDi(ct, i, 1)
                    addDi(ct, j, -1)
                    #ct is the constraint di - dj + err >= 0
                    #ct is the constraint err >= dj - di
                    objective.SetCoefficient(errorVar, 1)

                  
                
  

    print(f"Solving with {solver.SolverVersion()}")
    status = solver.Solve()

    if status == pywraplp.Solver.OPTIMAL:

        print("Solution:")
        print("Objective value =", objective.Value())

        d = []
        for i in range(n):
            for j in range(len(arrayOfDurations[i])):
                if booleanVars[i][j].solution_value() == 1:
                    d.append(arrayOfDurations[i][j])

        return d
    else:
        return "0"   #no solution



def main():
    arg = sys.argv[1].replace('\\', '')  
    print(arg)
    input = json.loads(arg)
    try:
        solution = func_timeout.func_timeout(2, solve, args=(input["dhats"], input["possibleDurations"], input["signature"]))
        #solve(input["dhats"], input["possibleDurations"], input["signature"])
        print(solution)
    except Exception as e:
        print(e)
        print(0)

if __name__ == "__main__":
    main()
